import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { saveLessonPosition } from '@/lib/services/progress-service'

const bodySchema = z.object({
  courseId: z.string().uuid(),
  positionSeconds: z.number().finite().min(0).max(60 * 60 * 24),
  durationSeconds: z.number().finite().positive().optional(),
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
      throw badRequest('Invalid playback request', parsed.error.flatten())
    }

    const result = await saveLessonPosition(authResult.context, {
      courseId: parsed.data.courseId,
      lessonId,
      positionSeconds: parsed.data.positionSeconds,
      durationSeconds: parsed.data.durationSeconds,
    })

    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
