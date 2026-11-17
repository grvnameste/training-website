import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  createLessonBlock,
  listLessonBlocks,
} from '@/lib/services/authoring-service'

const blockTypes = [
  'heading',
  'text',
  'callout',
  'code',
  'image',
  'video',
  'checklist',
  'resource',
] as const

const createSchema = z.object({
  type: z.enum(blockTypes),
  content: z.record(z.string(), z.unknown()).default({}),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { lessonId } = await params
    const blocks = await listLessonBlocks(authResult.context, lessonId)
    return NextResponse.json({ blocks })
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
    if (!parsed.success) throw badRequest('Invalid lesson block', parsed.error.flatten())

    const block = await createLessonBlock(authResult.context, lessonId, parsed.data)
    return NextResponse.json({ success: true, block }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
