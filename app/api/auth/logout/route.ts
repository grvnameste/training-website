import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, clearSessionCookie, verifySession } from '@/lib/auth/session'
import { revokeSession } from '@/lib/auth/session-store'

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value

  if (token) {
    const session = await verifySession(token)
    if (session) {
      await revokeSession(session.sid)
    }
  }

  const response = NextResponse.json({ success: true })
  clearSessionCookie(response)
  return response
}
