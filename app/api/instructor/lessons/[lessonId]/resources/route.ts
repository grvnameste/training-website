import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  createLessonResource,
  listLessonResources,
} from '@/lib/services/authoring-service'

const createSchema = z
  .object({
    title: z.string().min(1).max(200),
    kind: z.enum(['link', 'download']),
    externalUrl: z.string().url().optional(),
    storagePath: z.string().min(1).max(500).optional(),
    fileName: z.string().max(255).optional(),
    mimeType: z.string().max(200).optional(),
    sizeBytes: z.number().int().positive().optional(),
  })
  .refine(
    (value) =>
      (value.kind === 'link' && Boolean(value.externalUrl)) ||
      (value.kind === 'download' && Boolean(value.storagePath)),
    { message: 'A link resource needs externalUrl; a download resource needs storagePath' }
  )

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { lessonId } = await params
    const resources = await listLessonResources(authResult.context, lessonId)
    return NextResponse.json({ resources })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    const parsed = createSchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid resource', parsed.error.flatten())

    const resource = await createLessonResource(
      authResult.context,
      lessonId,
      parsed.data
    )
    return NextResponse.json({ success: true, resource }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
