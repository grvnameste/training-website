import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('Usage: node --env-file=.env.local scripts/apply-sql.mjs <file.sql> [more.sql ...]')
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const sql = postgres(url, { prepare: false, ssl: 'prefer', max: 1 })

try {
  for (const file of files) {
    await sql.unsafe(readFileSync(file, 'utf8'))
    console.log(`Applied ${file}`)
  }
} catch (error) {
  console.error('Failed to apply SQL:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
