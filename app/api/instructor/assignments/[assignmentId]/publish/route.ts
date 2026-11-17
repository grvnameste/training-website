import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import { publishAssignment } from '@/lib/services/assignment-service'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { assignmentId } = await params
    const assignment = await publishAssignment(authResult.context, assignmentId)
    return NextResponse.json({ assignment })
  } catch (error) {
    return toErrorResponse(error)
  }
}
