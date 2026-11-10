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
