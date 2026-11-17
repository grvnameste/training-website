import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { lessonNotes } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { badRequest, notFound, toErrorResponse } from '@/lib/http/errors'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { assertCourseLearn, getCourseById } from '@/lib/services/course-access-service'
import { getLessonCourseId } from '@/lib/services/progress-service'

const bodySchema = z.object({
  content: z.string().max(50_000),
})

async function resolveLesson(ctx: Parameters<typeof assertCourseLearn>[0], lessonId: string) {
  const courseId = await getLessonCourseId(lessonId)
  if (!courseId) throw notFound('Lesson not found')
  const course = await getCourseById(courseId)
  if (!course) throw notFound('Course not found')
  await assertCourseLearn(ctx, course)
  return course
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    await resolveLesson(authResult.context, lessonId)

    const [note] = await db
      .select()
      .from(lessonNotes)
      .where(
        and(
          eq(lessonNotes.studentId, authResult.context.profile.id),
          eq(lessonNotes.lessonId, lessonId)
        )
      )
      .limit(1)

    return NextResponse.json({ content: note?.content ?? '' })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    await resolveLesson(authResult.context, lessonId)

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid note', parsed.error.flatten())
    }

    await db
      .insert(lessonNotes)
      .values({
        studentId: authResult.context.profile.id,
        lessonId,
        content: parsed.data.content,
      })
      .onConflictDoUpdate({
        target: [lessonNotes.studentId, lessonNotes.lessonId],
        set: { content: parsed.data.content, updatedAt: new Date() },
      })

    return NextResponse.json({ success: true, content: parsed.data.content })
  } catch (error) {
    return toErrorResponse(error)
  }
}
