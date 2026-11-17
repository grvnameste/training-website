// app/api/teacher/student-profiles/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole } from '@/lib/auth/server'

export async function POST(req: Request) {
  // 🔒 Enforce Teacher or Super Admin access
  const authResult = await requireRole(['teacher', 'super_admin'])
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const { studentIds } = await req.json()

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'studentIds must be a non-empty array' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdiafdknsvbutdrkobwi.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    )

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, full_name, avatar_url, email')
      .in('id', studentIds)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const normalized = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.full_name || 'Student',
      avatar: p.avatar_url || null,
      email: p.email || null,
    }))

    return NextResponse.json(normalized)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 })
  }
}
