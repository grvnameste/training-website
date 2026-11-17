import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { listReviewQueue } from '@/lib/services/assignment-service'

export async function GET(req: Request) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const courseId = new URL(req.url).searchParams.get('courseId') ?? undefined
    const submissions = await listReviewQueue(authResult.context, courseId)
    return NextResponse.json({ submissions })
  } catch (error) {
    return toErrorResponse(error)
  }
}
