import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getLearningWorkspace } from '@/lib/services/learning-workspace-service'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { courseId } = await params
    const lessonId = new URL(req.url).searchParams.get('lessonId')
    const payload = await getLearningWorkspace(authResult.context, courseId, lessonId)
    return NextResponse.json(payload)
  } catch (error) {
    return toErrorResponse(error)
  }
}
