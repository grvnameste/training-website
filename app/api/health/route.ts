import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { logger } from '@/lib/observability/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  try {
    const [database] = await db.execute<{ ok: number }>(sql`select 1 as ok`)
    const [ledger] = await db.execute<{ applied: number }>(
      sql`select count(*)::int as applied from schema_migrations`
    )
    const [latest] = await db.execute<{ last_applied: string | null }>(
      sql`select max(applied_at)::text as last_applied from schema_migrations`
    )

    return NextResponse.json({
      status: 'ok',
      database: database?.ok === 1 ? 'ok' : 'unknown',
      migrations: {
        applied: ledger?.applied ?? 0,
        lastAppliedAt: latest?.last_applied ?? null,
      },
      latencyMs: Date.now() - startedAt,
    })
  } catch (error) {
    logger.exception('health_check_failed', error)
    return NextResponse.json(
      {
        status: 'error',
        database: 'unavailable',
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 }
    )
  }
}
