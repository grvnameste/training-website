import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>
}

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local before using the database.')
  }
  // prepare: false keeps the driver compatible with pooled connections (pgbouncer).
  // ssl: 'prefer' uses TLS when the server offers it (Supabase) and falls back for local Postgres.
  return postgres(url, {
    prepare: false,
    ssl: 'prefer',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15,
    max_lifetime: 60 * 30,
  })
}

const client = globalForDb.__pgClient ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__pgClient = client
}

export const db = drizzle(client, { schema })
export { schema }
export type Database = typeof db
