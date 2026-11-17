import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { completeLesson, saveLessonPosition } from '@/lib/services/progress-service'

const bodySchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  completed: z.boolean().optional(),
  positionSeconds: z.number().finite().min(0).optional(),
  durationSeconds: z.number().finite().positive().optional(),
})

/**
 * Compatibility endpoint. Prefer /api/learning/lessons/[lessonId]/complete
 * and /api/learning/lessons/[lessonId]/position.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid progress request', parsed.error.flatten())
    }

    const { context } = authResult
    const { courseId, lessonId, completed, positionSeconds, durationSeconds } = parsed.data

    if (completed === true) {
      const progress = await completeLesson(context, { courseId, lessonId })
      return NextResponse.json({ success: true, completedLessons: progress.completedLessonIds })
    }

    if (typeof positionSeconds === 'number') {
      const result = await saveLessonPosition(context, {
        courseId,
        lessonId,
        positionSeconds,
        durationSeconds,
      })
      return NextResponse.json(result)
    }

    throw badRequest('No progress action requested')
  } catch (error) {
    return toErrorResponse(error)
  }
}
