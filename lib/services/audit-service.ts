import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'

export interface AuditInput {
  action: string
  resourceType: string
  resourceId: string
  companyId?: string | null
  metadata?: Record<string, unknown>
  ip?: string | null
  userAgent?: string | null
}

export async function recordAudit(ctx: AuthContext, input: AuditInput) {
  try {
    await db.insert(auditLogs).values({
      actorUserId: ctx.userId,
      actorProfileId: ctx.profile.id,
      companyId: input.companyId ?? ctx.profile.company_id ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata ?? {},
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    })
  } catch (error) {
    // Audit must never break the primary operation, but it must be visible.
    console.error('[audit] Failed to record event:', error)
  }
}
