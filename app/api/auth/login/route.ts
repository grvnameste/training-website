import { eq, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, users } from '@/lib/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { setSessionCookie, signSession } from '@/lib/auth/session'
import {
  createSessionRecord,
  newSessionId,
} from '@/lib/auth/session-store'
import { normalizeRole, provisionProfile, toPublicUser } from '@/lib/auth/users'
import { enforceRateLimit } from '@/lib/http/rate-limit'

// Constant-cost comparison target so unknown accounts take the same time as
// wrong passwords and cannot be enumerated.
const DUMMY_PASSWORD_HASH =
  '$2b$12$cqiXCYkZD7d9.pTAlq6DeeRgyS2bXFImruLm0.I9rMYdn6gBw5F6O'

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, 'auth:login', 10, 60_000)
  if (limited) return limited

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const identifier =
    typeof body.identifier === 'string'
      ? body.identifier.trim().toLowerCase()
      : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!identifier || !password) {
    return NextResponse.json(
      { error: 'Username/email and password are required' },
      { status: 400 }
    )
  }

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier)))
    .limit(1)

  const passwordMatches = await verifyPassword(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH
  )

  if (!user || !passwordMatches) {
    return NextResponse.json(
      { error: 'Invalid username/email or password' },
      { status: 401 }
    )
  }

  if (user.status !== 'active') {
    return NextResponse.json({ error: 'This account is suspended' }, { status: 403 })
  }

  let [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!profile) {
    profile = await provisionProfile(user)
  }

  const role = normalizeRole(user.role)
  const sid = newSessionId()
  const token = await signSession({ id: user.id, username: user.username, role, sid })

  await createSessionRecord({
    sessionId: sid,
    userId: user.id,
    token,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
  })

  const response = NextResponse.json({ user: toPublicUser(user, profile) })
  setSessionCookie(response, token)
  return response
}
