<<<<<<< HEAD
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
=======
//app/api/chat/mark-read/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { roomId, userId } = await req.json()
    console.log('API mark-read request:', { roomId, userId })
    
    if (!roomId || !userId) {
      return NextResponse.json({ error: 'Missing roomId or userId' }, { status: 400 })
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: updated, error } = await supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .eq('is_read', false)
      .neq('sender_id', userId)
      .select('id')

    if (error) {
      console.error('API Admin Update Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`API successfully marked ${updated?.length || 0} messages as read`)
    return NextResponse.json({ success: true, count: updated?.length || 0 })
  } catch (err: any) {
    console.error('API Internal Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
