//app/api/create-user/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🔥 SERVER SIDE CLIENT
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("REQ BODY:", body)

    const { clerkId, name, email } = body

    if (!clerkId) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 })
    }

    // 🔥 check existing
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', clerkId)
      .maybeSingle()

    if (existing) {
      console.log("USER ALREADY EXISTS")
      return NextResponse.json({ message: 'User already exists' })
    }

    // 🔥 insert
    const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        clerk_id: clerkId,
        name: name || 'User',
        role: 'student'
      },
      { onConflict: 'clerk_id' }
    )

    if (error) {
      console.error("INSERT ERROR:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    console.log("USER CREATED SUCCESS")

    return NextResponse.json({ message: 'User created' })

  } catch (err) {
    console.error("SERVER ERROR:", err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}