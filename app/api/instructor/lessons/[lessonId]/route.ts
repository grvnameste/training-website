import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { deleteLesson, updateLessonSettings } from '@/lib/services/authoring-service'

const settingsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(2000).nullable().optional(),
  objectives: z.array(z.string().min(1).max(300)).max(20).optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  completionMode: z.enum(['manual', 'video_ended']).optional(),
  isPreview: z.boolean().optional(),
  videoUrl: z.string().max(2000).nullable().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    const parsed = settingsSchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid lesson settings', parsed.error.flatten())

    const updated = await updateLessonSettings(
      authResult.context,
      lessonId,
      parsed.data
    )
    return NextResponse.json({ success: true, lesson: updated })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    await deleteLesson(authResult.context, lessonId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
