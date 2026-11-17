import { jwtVerify, SignJWT } from 'jose'
import type { NextResponse } from 'next/server'
import { isUserRole, type UserRole } from './types'

export const SESSION_COOKIE = 'readnrevise_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

const DEV_FALLBACK_SECRET = 'dev-only-insecure-session-secret-change-me'

export interface SessionUser {
  id: string
  username: string
  role: UserRole
  sid: string
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable is required in production')
    }
    return new TextEncoder().encode(DEV_FALLBACK_SECRET)
  }
  return new TextEncoder().encode(secret)
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ username: user.username, role: user.role, sid: user.sid })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey())
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    })

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.username !== 'string' ||
      typeof payload.sid !== 'string' ||
      !isUserRole(payload.role)
    ) {
      return null
    }

    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      sid: payload.sid,
    }
  } catch {
    return null
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
