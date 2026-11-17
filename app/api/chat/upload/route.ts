<<<<<<< HEAD
// app/api/chat/upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth/server'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
])

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export async function POST(req: Request) {
  try {
    // 🔒 Enforce authentication
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { context } = authResult
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Missing file in request payload' }, { status: 400 })
    }

    // 🔒 File type validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type '${file.type}' is not allowed. Supported formats: images, videos (MP4/WebM), PDF.` },
        { status: 400 }
      )
    }

    // 🔒 File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 25MB' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdiafdknsvbutdrkobwi.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    )

    const buffer = Buffer.from(await file.arrayBuffer())

    // 🔒 Path Traversal Prevention: Server-controlled safe file path with UUID
    const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin'
    const safeFilePath = `chat/${context.profile.id}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(safeFilePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Chat upload storage error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('chat-media').getPublicUrl(safeFilePath)

    return NextResponse.json({ publicUrl, filePath: safeFilePath })
  } catch (err: any) {
    console.error('Chat upload catch error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
=======
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
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
