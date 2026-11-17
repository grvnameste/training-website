import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'

const url = process.env.TEST_DATABASE_URL?.trim()
if (!url) {
  console.error('TEST_DATABASE_URL is not set')
  process.exit(1)
}

const host = new URL(url).hostname
const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'postgres'])
if (!localHosts.has(host) && process.env.ALLOW_REMOTE_TEST_DB !== '1') {
  console.error(
    `Refusing to prepare the test schema on ${host}. ` +
      'Set ALLOW_REMOTE_TEST_DB=1 only for an isolated CI database.'
  )
  process.exit(1)
}

const sql = postgres(url, {
  prepare: false,
  ssl: 'prefer',
  max: 1,
  onnotice: () => {},
})

try {
  const schema = readFileSync(
    join(process.cwd(), 'tests', 'integration', 'schema.sql'),
    'utf8'
  )
  await sql.unsafe(schema)
  console.log('Integration test schema is ready')
} catch (error) {
  console.error(
    'Integration test schema setup failed:',
    error instanceof Error ? error.message : error
  )
  process.exitCode = 1
} finally {
  await sql.end()
}
