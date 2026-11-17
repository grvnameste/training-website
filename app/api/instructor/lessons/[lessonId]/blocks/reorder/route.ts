import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { reorderLessonBlocks } from '@/lib/services/authoring-service'

const schema = z.object({ orderedIds: z.array(z.string().uuid()).min(1) })

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { lessonId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid block order', parsed.error.flatten())

    await reorderLessonBlocks(
      authResult.context,
      lessonId,
      parsed.data.orderedIds
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
