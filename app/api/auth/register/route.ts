import { eq, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, users } from '@/lib/db/schema'
import { isBreachedPassword } from '@/lib/auth/breached-password'
import { hashPassword } from '@/lib/auth/password'
import { setSessionCookie, signSession } from '@/lib/auth/session'
import {
  createSessionRecord,
  newSessionId,
} from '@/lib/auth/session-store'
import { normalizeRole, toPublicUser } from '@/lib/auth/users'
import {
  normalizeEmail,
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/auth/validation'
import { enforceRateLimit } from '@/lib/http/rate-limit'

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, 'auth:register', 5, 10 * 60_000)
  if (limited) return limited

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const username = normalizeUsername(body.username)
  const email = normalizeEmail(body.email)
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  const validationError =
    validateUsername(username) || validateEmail(email) || validatePassword(password)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  if (await isBreachedPassword(password)) {
    return NextResponse.json(
      { error: 'This password has appeared in a known data breach. Choose a different password' },
      { status: 400 }
    )
  }

  const existing = await db
    .select({ username: users.username, email: users.email })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1)

  if (existing.length > 0) {
    const message =
      existing[0].username === username
        ? 'Username is already taken'
        : 'Email is already registered'
    return NextResponse.json({ error: message }, { status: 409 })
  }

  const [firstName, ...restName] = name.split(/\s+/).filter(Boolean)
  const displayName = name || username

  try {
    const user = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          username,
          email,
          passwordHash: await hashPassword(password),
          role: 'student',
        })
        .returning()

      const [profile] = await tx
        .insert(profiles)
        .values({
          userId: newUser.id,
          name: displayName,
          fullName: displayName,
          firstName: firstName || null,
          lastName: restName.length ? restName.join(' ') : null,
          email,
          role: 'student',
        })
        .returning()

      return { ...newUser, profile }
    })

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

    const response = NextResponse.json(
      { user: toPublicUser(user, user.profile) },
      { status: 201 }
    )
    setSessionCookie(response, token)
    return response
  } catch (error) {
    if ((error as { code?: string })?.code === '23505') {
      return NextResponse.json(
        { error: 'Username or email is already registered' },
        { status: 409 }
      )
    }
    console.error('[auth/register]', error)
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 })
  }
}
