import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import { deleteSection } from '@/lib/services/authoring-service'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { sectionId } = await params
    await deleteSection(authResult.context, sectionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
