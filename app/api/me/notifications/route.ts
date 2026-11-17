import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import {
  listNotifications,
  markAllNotificationsRead,
} from '@/lib/services/notification-service'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const data = await listNotifications(authResult.context.profile.id)
    return NextResponse.json(data)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    await markAllNotificationsRead(authResult.context.profile.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
