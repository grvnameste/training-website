import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  deleteLessonBlock,
  updateLessonBlock,
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

const updateSchema = z.object({
  type: z.enum(blockTypes).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { blockId } = await params
    const parsed = updateSchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid block update', parsed.error.flatten())

    const block = await updateLessonBlock(
      authResult.context,
      blockId,
      parsed.data
    )
    return NextResponse.json({ success: true, block })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { blockId } = await params
    await deleteLessonBlock(authResult.context, blockId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
