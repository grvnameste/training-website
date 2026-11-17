import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getStudentBoard } from '@/lib/services/board-service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ capstoneId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const { capstoneId } = await params
    const board = await getStudentBoard(authResult.context, capstoneId)
    return NextResponse.json(board)
  } catch (error) {
    return toErrorResponse(error)
  }
}
