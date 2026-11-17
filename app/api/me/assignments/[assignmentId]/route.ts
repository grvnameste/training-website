import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getStudentAssignment } from '@/lib/services/assignment-service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const { assignmentId } = await params
    const data = await getStudentAssignment(authResult.context, assignmentId)
    return NextResponse.json(data)
  } catch (error) {
    return toErrorResponse(error)
  }
}
