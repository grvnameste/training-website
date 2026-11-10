//app/api/chat/upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const filePath = formData.get('filePath') as string

    if (!file || !filePath) {
      return NextResponse.json({ error: 'Missing file or filePath' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('API Upload Error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(filePath)

    return NextResponse.json({ publicUrl })
  } catch (err: any) {
    console.error('API Catch Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
