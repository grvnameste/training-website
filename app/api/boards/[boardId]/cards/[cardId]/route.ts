import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { deleteCard, updateCard } from '@/lib/services/board-service'

const schema = z.object({
  listId: z.string().uuid().optional(),
  position: z.number().int().min(0).optional(),
  title: z.string().min(1).max(300).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { boardId, cardId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid card update', parsed.error.flatten())

    const card = await updateCard(authResult.context, boardId, cardId, parsed.data)
    return NextResponse.json({ card })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { boardId, cardId } = await params
    await deleteCard(authResult.context, boardId, cardId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
