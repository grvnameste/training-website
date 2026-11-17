import { createHash, randomUUID } from 'node:crypto'
import { and, eq, isNull, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { userSessions } from '@/lib/db/schema'
import { SESSION_MAX_AGE } from './session'

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function newSessionId(): string {
  return randomUUID()
}

export async function createSessionRecord(input: {
  sessionId: string
  userId: string
  token: string
  userAgent?: string | null
  ip?: string | null
}) {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  await db.insert(userSessions).values({
    id: input.sessionId,
    userId: input.userId,
    tokenHash: hashSessionToken(input.token),
    userAgent: input.userAgent ?? null,
    ip: input.ip ?? null,
    expiresAt,
  })

  return expiresAt
}

export async function getActiveSession(sessionId: string, userId: string) {
  const [session] = await db
    .select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.id, sessionId),
        eq(userSessions.userId, userId),
        isNull(userSessions.revokedAt)
      )
    )
    .limit(1)

  if (!session) return null
  if (session.expiresAt.getTime() <= Date.now()) return null
  return session
}

export async function revokeSession(sessionId: string) {
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(userSessions.id, sessionId), isNull(userSessions.revokedAt)))
}

export async function cleanupExpiredSessions() {
  const removed = await db
    .delete(userSessions)
    .where(lt(userSessions.expiresAt, new Date()))
    .returning({ id: userSessions.id })
  return removed.length
}
