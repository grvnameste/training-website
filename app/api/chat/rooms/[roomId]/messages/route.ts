import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  listRoomMessages,
  sendRoomMessage,
} from '@/lib/services/chat-service'

const bodySchema = z
  .object({
    content: z.string().max(4000).optional(),
    mediaUrl: z.string().max(2000).optional(),
    mediaType: z.enum(['image', 'video']).optional(),
  })
  .refine((value) => Boolean(value.content?.trim() || value.mediaUrl), {
    message: 'Message content or media is required',
  })

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const { roomId } = await params
    const messages = await listRoomMessages(authResult.context, roomId)
    return NextResponse.json({ messages })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { roomId } = await params
    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid message', parsed.error.flatten())

    const message = await sendRoomMessage(authResult.context, roomId, {
      content: parsed.data.content?.trim() || null,
      mediaUrl: parsed.data.mediaUrl ?? null,
      mediaType: parsed.data.mediaType ?? null,
    })
    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
