import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { listChatRooms } from '@/lib/services/chat-service'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const rooms = await listChatRooms(authResult.context)
    return NextResponse.json({ rooms })
  } catch (error) {
    return toErrorResponse(error)
  }
}
