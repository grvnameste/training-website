import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import { markNotificationRead } from '@/lib/services/notification-service'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const { notificationId } = await params
    await markNotificationRead(authResult.context.profile.id, notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
