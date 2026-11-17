import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { markRoomRead } from '@/lib/services/chat-service'

const schema = z.object({ roomId: z.string().uuid() })

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid room', parsed.error.flatten())

    await markRoomRead(authResult.context, parsed.data.roomId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
