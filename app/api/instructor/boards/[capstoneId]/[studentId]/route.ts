import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getInstructorBoard } from '@/lib/services/board-service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ capstoneId: string; studentId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { capstoneId, studentId } = await params
    const board = await getInstructorBoard(authResult.context, capstoneId, studentId)
    return NextResponse.json(board)
  } catch (error) {
    return toErrorResponse(error)
  }
}
