import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { addCard } from '@/lib/services/board-service'

const schema = z.object({
  listId: z.string().uuid(),
  title: z.string().min(1).max(300),
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
    if (!parsed.success) throw badRequest('Invalid card', parsed.error.flatten())

    const card = await addCard(authResult.context, boardId, parsed.data)
    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
