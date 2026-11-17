import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { auditLogs, profiles } from '@/lib/db/schema'
import { toErrorResponse } from '@/lib/http/errors'

function parseDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(req: Request) {
  try {
    const authResult = await requireRole(['super_admin'])
    if (!authResult.success) return authResult.response

    const params = new URL(req.url).searchParams
    const action = params.get('action')?.trim()
    const resourceType = params.get('resourceType')?.trim()
    const actorProfileId = params.get('actorProfileId')?.trim()
    const from = parseDate(params.get('from'))
    const to = parseDate(params.get('to'))
    const page = Math.max(1, Number(params.get('page') ?? 1) || 1)
    const pageSize = Math.min(
      100,
      Math.max(1, Number(params.get('pageSize') ?? 25) || 25)
    )

    const filters = []
    if (action) filters.push(ilike(auditLogs.action, `%${action}%`))
    if (resourceType) filters.push(eq(auditLogs.resourceType, resourceType))
    if (actorProfileId) filters.push(eq(auditLogs.actorProfileId, actorProfileId))
    if (from) filters.push(gte(auditLogs.createdAt, from))
    if (to) filters.push(lte(auditLogs.createdAt, to))
    const where = filters.length > 0 ? and(...filters) : undefined

    const [logs, totals] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          resourceType: auditLogs.resourceType,
          resourceId: auditLogs.resourceId,
          metadata: auditLogs.metadata,
          ip: auditLogs.ip,
          userAgent: auditLogs.userAgent,
          createdAt: auditLogs.createdAt,
          actorProfileId: auditLogs.actorProfileId,
          actorName: profiles.name,
          actorEmail: profiles.email,
          companyId: auditLogs.companyId,
        })
        .from(auditLogs)
        .leftJoin(profiles, eq(profiles.id, auditLogs.actorProfileId))
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(where),
    ])

    return NextResponse.json({
      logs,
      total: totals[0]?.count ?? 0,
      page,
      pageSize,
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
