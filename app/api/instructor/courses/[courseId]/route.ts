import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  getCourseContent,
  updateCourseMetadata,
} from '@/lib/services/authoring-service'

const metadataSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  subtitle: z.string().max(300).nullable().optional(),
  description: z.string().max(10_000).nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  outcomes: z.array(z.string().min(1).max(300)).max(20).optional(),
  prerequisites: z.array(z.string().min(1).max(300)).max(20).optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  whatYouBuild: z.string().max(5000).nullable().optional(),
  certificateEnabled: z.boolean().optional(),
  thumbnailUrl: z.string().max(2000).nullable().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { courseId } = await params
    const content = await getCourseContent(authResult.context, courseId)
    return NextResponse.json(content)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { courseId } = await params
    const parsed = metadataSchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid course metadata', parsed.error.flatten())

    const updated = await updateCourseMetadata(
      authResult.context,
      courseId,
      parsed.data
    )
    return NextResponse.json({ success: true, course: updated })
  } catch (error) {
    return toErrorResponse(error)
  }
}
