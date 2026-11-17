import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { completeLesson } from '@/lib/services/progress-service'

const bodySchema = z.object({
  courseId: z.string().uuid(),
  source: z.enum(['explicit', 'video_ended']).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid completion request', parsed.error.flatten())
    }

    const progress = await completeLesson(authResult.context, {
      courseId: parsed.data.courseId,
      lessonId,
      source: parsed.data.source,
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    return toErrorResponse(error)
  }
}
