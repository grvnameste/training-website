import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import { deleteLessonResource } from '@/lib/services/authoring-service'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { resourceId } = await params
    await deleteLessonResource(authResult.context, resourceId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
