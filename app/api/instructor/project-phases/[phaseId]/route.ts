import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import { deletePhase } from '@/lib/services/project-service'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { phaseId } = await params
    await deletePhase(authResult.context, phaseId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
