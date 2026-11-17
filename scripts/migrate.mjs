import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'

const args = process.argv.slice(2)
const command = args[0] && !args[0].startsWith('-') ? args[0] : 'up'
const flags = new Set(args.filter((arg) => arg.startsWith('--')))
const upTo = args
  .find((arg) => arg.startsWith('--up-to='))
  ?.slice('--up-to='.length)
const dryRun = flags.has('--dry-run')
const fresh = flags.has('--fresh')
const allowChecksumDrift = flags.has('--allow-checksum-drift')

const url =
  command === 'fresh' && process.env.TEST_DATABASE_URL?.trim()
    ? process.env.TEST_DATABASE_URL.trim()
    : process.env.DATABASE_URL
if (!url) {
  console.error(
    command === 'fresh'
      ? 'TEST_DATABASE_URL or DATABASE_URL must be set'
      : 'DATABASE_URL is not set'
  )
  process.exit(1)
}

if (command === 'fresh') {
  const host = new URL(url).hostname
  const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'postgres'])
  if (!localHosts.has(host) && process.env.ALLOW_REMOTE_FRESH !== '1') {
    console.error(
      `Refusing fresh install against ${host}. ` +
        'Set ALLOW_REMOTE_FRESH=1 only for an isolated database.'
    )
    process.exit(1)
  }
}

const directory = join(process.cwd(), 'supabase', 'migrations')
const files = readdirSync(directory)
  .filter((file) => file.endsWith('.sql'))
  .sort()
const migrations = files.map((file) => readMigration(file))

const drizzleDirectory = join(process.cwd(), 'drizzle')
const drizzleFiles = readdirSync(drizzleDirectory)
  .filter((file) => file.endsWith('.sql'))
  .sort()
const baselineFile = drizzleFiles.at(-1)
const platformFile = join(process.cwd(), 'supabase', 'baseline', 'platform.sql')

const LEDGER_LOCK_ID = 730501

function checksum(source) {
  return createHash('sha256').update(source).digest('hex')
}

function readMigration(file) {
  const source = readFileSync(join(directory, file), 'utf8')
  return { file, source, checksum: checksum(source) }
}

async function ensureLedger(sql) {
  await sql`
    create table if not exists "schema_migrations" (
      "filename" text primary key,
      "checksum" text not null,
      "applied_at" timestamptz not null default now(),
      "execution_ms" integer
    )
  `
}

async function appliedRows(sql) {
  return sql`
    select filename, checksum, applied_at, execution_ms
    from "schema_migrations"
    order by filename
  `
}

function reportDrift(rows) {
  const byFile = new Map(rows.map((row) => [row.filename, row]))
  const drift = []
  for (const migration of migrations) {
    const applied = byFile.get(migration.file)
    if (applied && applied.checksum !== migration.checksum) {
      drift.push(migration.file)
    }
  }
  return drift
}

async function withLock(sql, callback) {
  await sql`select pg_advisory_lock(${LEDGER_LOCK_ID})`
  try {
    return await callback()
  } finally {
    await sql`select pg_advisory_unlock(${LEDGER_LOCK_ID})`
  }
}

async function commandStatus(sql) {
  await ensureLedger(sql)
  const rows = await appliedRows(sql)
  const byFile = new Map(rows.map((row) => [row.filename, row]))
  const drift = reportDrift(rows)

  for (const migration of migrations) {
    const applied = byFile.get(migration.file)
    const state = !applied
      ? 'pending'
      : drift.includes(migration.file)
      ? 'drift'
      : 'applied'
    console.log(
      `${state.padEnd(8)} ${migration.file}${
        applied ? `  (${applied.applied_at.toISOString()})` : ''
      }`
    )
  }

  const pending = migrations.filter((migration) => !byFile.has(migration.file)).length
  console.log(`\n${migrations.length} migrations, ${rows.length} applied, ${pending} pending`)
  if (drift.length > 0) {
    console.error(`Checksum drift detected: ${drift.join(', ')}`)
    process.exitCode = 1
  }
}

async function commandBaseline(sql) {
  await ensureLedger(sql)
  if (!upTo && !flags.has('--all')) {
    console.error(
      'Baseline requires --up-to=<filename> (inclusive) or --all.\n' +
        'Use --up-to to mark migrations that were already applied by schema effects.'
    )
    process.exit(1)
  }
  if (upTo && !files.includes(upTo)) {
    console.error(`Unknown migration: ${upTo}`)
    process.exit(1)
  }

  const limitIndex = upTo ? files.indexOf(upTo) : files.length - 1
  const baselineFiles = files.slice(0, limitIndex + 1)
  const rows = await appliedRows(sql)
  const applied = new Map(rows.map((row) => [row.filename, row]))

  for (const migration of baselineFiles.map((file) => readMigration(file))) {
    if (applied.has(migration.file)) {
      console.log(`skip     ${migration.file}`)
      continue
    }
    if (dryRun) {
      console.log(`would baseline ${migration.file}`)
      continue
    }
    await sql`
      insert into "schema_migrations" ("filename", "checksum", "execution_ms")
      values (${migration.file}, ${migration.checksum}, null)
      on conflict ("filename") do nothing
    `
    console.log(`baseline ${migration.file}`)
  }
}

async function commandFresh(sql) {
  if (!baselineFile) {
    console.error('No Drizzle baseline SQL found in ./drizzle')
    process.exitCode = 1
    return
  }

  const [existing] = await sql`
    select count(*)::int as count
    from pg_tables
    where schemaname = 'public' and tablename <> 'schema_migrations'
  `
  if (existing.count > 0 && !dryRun) {
    console.error(
      'Fresh install requires an empty database. Public tables already exist.\n' +
        'Use `npm run db:migrate` for an existing database, or `db:migrate:baseline` first.'
    )
    process.exitCode = 1
    return
  }

  const baselineSource = readFileSync(join(drizzleDirectory, baselineFile), 'utf8')
  const platformSource = readFileSync(platformFile, 'utf8')

  if (dryRun) {
    console.log(`would apply ${baselineFile}`)
    console.log('would apply supabase/baseline/platform.sql')
    console.log(`would record ${migrations.length} migrations in schema_migrations`)
    return
  }

  await withLock(sql, async () => {
    await sql.begin(async (tx) => {
      await tx.unsafe(baselineSource)
      await tx.unsafe(platformSource)
    })
    await ensureLedger(sql)

    for (const migration of migrations) {
      await sql`
        insert into "schema_migrations" ("filename", "checksum", "execution_ms")
        values (${migration.file}, ${migration.checksum}, null)
        on conflict ("filename") do nothing
      `
    }
  })

  console.log(`Applied ${baselineFile} and supabase/baseline/platform.sql`)
  console.log(`Recorded ${migrations.length} migrations as represented by the baseline`)
}

async function commandUp(sql) {
  await ensureLedger(sql)
  await withLock(sql, async () => {
    const rows = await appliedRows(sql)
    const applied = new Map(rows.map((row) => [row.filename, row]))

    if (applied.size === 0 && !fresh) {
      const [existing] = await sql`select to_regclass('public.courses') as courses`
      if (existing?.courses) {
        console.error(
          'This database already contains application tables but has no migration ledger.\n' +
            'Baseline the migrations that are already in effect first, e.g.:\n' +
            '  npm run db:migrate:baseline -- --up-to=20261130000000_phase3b_projects.sql\n' +
            'Then run `npm run db:migrate` to apply the remaining migrations.\n' +
            'Pass --fresh only when the database is truly empty.'
        )
        process.exitCode = 1
        return
      }
    }

    const drift = reportDrift(rows)
    if (drift.length > 0 && !allowChecksumDrift) {
      console.error(
        `Checksum drift detected for already-applied migrations: ${drift.join(', ')}\n` +
          'The ledger records exactly what was applied. Do not edit applied migrations.\n' +
          'Pass --allow-checksum-drift only after confirming the change is intentional.'
      )
      process.exitCode = 1
      return
    }

    for (const migration of migrations) {
      if (applied.has(migration.file)) {
        console.log(`skip     ${migration.file}`)
        continue
      }
      if (dryRun) {
        console.log(`would apply ${migration.file}`)
        continue
      }

      const started = Date.now()
      try {
        await sql.begin(async (tx) => {
          await tx.unsafe(migration.source)
          await tx`
            insert into "schema_migrations" ("filename", "checksum", "execution_ms")
            values (${migration.file}, ${migration.checksum}, ${Date.now() - started})
          `
        })
      } catch (error) {
        console.error(
          `Migration failed: ${migration.file}\n` +
            (error instanceof Error ? error.message : String(error))
        )
        process.exitCode = 1
        return
      }
      console.log(`applied  ${migration.file} (${Date.now() - started}ms)`)
    }
  })
}

const sql = postgres(url, {
  prepare: false,
  ssl: 'prefer',
  max: 1,
  onnotice: () => {},
})

try {
  if (command === 'status') {
    await commandStatus(sql)
  } else if (command === 'baseline') {
    await commandBaseline(sql)
  } else if (command === 'up') {
    await commandUp(sql)
  } else if (command === 'fresh') {
    await commandFresh(sql)
  } else {
    console.error(`Unknown command: ${command}. Use status, baseline, up, or fresh.`)
    process.exitCode = 1
  }
} catch (error) {
  console.error('Migration command failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
