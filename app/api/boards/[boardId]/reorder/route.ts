import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { reorderCards } from '@/lib/services/board-service'

const schema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        listId: z.string().uuid(),
        position: z.number().int().min(0),
      })
    )
    .min(1),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { boardId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid board order', parsed.error.flatten())

    await reorderCards(authResult.context, boardId, parsed.data.items)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
