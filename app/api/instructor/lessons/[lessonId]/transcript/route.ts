import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { lessonTranscripts } from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  assertLessonManage,
  upsertLessonTranscript,
} from '@/lib/services/authoring-service'

const schema = z.object({
  fullText: z.string().min(1).max(200_000),
  language: z.string().min(2).max(20).optional(),
  segments: z.array(z.record(z.string(), z.unknown())).max(5000).optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { lessonId } = await params
    await assertLessonManage(authResult.context, lessonId)

    const [transcript] = await db
      .select()
      .from(lessonTranscripts)
      .where(eq(lessonTranscripts.lessonId, lessonId))
      .limit(1)

    return NextResponse.json({ transcript: transcript ?? null })
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
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid transcript', parsed.error.flatten())

    const transcript = await upsertLessonTranscript(
      authResult.context,
      lessonId,
      parsed.data
    )
    return NextResponse.json({ success: true, transcript })
  } catch (error) {
    return toErrorResponse(error)
  }
}
