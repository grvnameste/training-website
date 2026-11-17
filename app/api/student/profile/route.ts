// app/api/student/profile/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth/server'

const getSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdiafdknsvbutdrkobwi.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )

export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult.response
  }

  const { context } = authResult
  const supabase = getSupabaseAdmin()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', context.profile.id)
    .maybeSingle()

  if (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const resolved = profile || context.profile
  return NextResponse.json({
    ...resolved,
    avatar: resolved.avatar_url || resolved.avatar,
  })
}

export async function PUT(req: Request) {
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult.response
  }

  const { context } = authResult

  try {
    const body = await req.json()
    const { firstName, lastName, about, avatar, projects, skills, resumeData } = body

    const supabase = getSupabaseAdmin()
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (firstName !== undefined || lastName !== undefined) {
      const f = typeof firstName === 'string' ? firstName.trim() : ''
      const l = typeof lastName === 'string' ? lastName.trim() : ''
      const fullName = `${f} ${l}`.trim()
      if (fullName) {
        updatePayload.name = fullName
        updatePayload.full_name = fullName
      }
      if (firstName !== undefined) updatePayload.first_name = f
      if (lastName !== undefined) updatePayload.last_name = l
    }

    if (typeof about === 'string') {
      updatePayload.about = about.slice(0, 2000)
    }

    if (typeof avatar === 'string' && avatar.length > 0) {
      updatePayload.avatar_url = avatar
    }

    if (Array.isArray(projects)) {
      updatePayload.projects = projects
    }

    if (Array.isArray(skills)) {
      updatePayload.skills = skills
    }

    if (resumeData !== undefined && resumeData !== null) {
      updatePayload.resume_data = resumeData
    }

    // Attempt full update; if a remote database lacks optional columns, gracefully strip missing column(s) and retry
    let payloadToWrite = { ...updatePayload }
    let updatedProfile: any = null
    let lastError: any = null

    for (let attempt = 0; attempt < 6; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .update(payloadToWrite)
        .eq('id', context.profile.id)
        .select('*')
        .single()

      if (!error) {
        updatedProfile = data
        lastError = null
        break
      }

      lastError = error
      // Detect PostgreSQL / PostgREST missing column errors like: Could not find the 'xyz' column
      const match =
        error.message?.match(/Could not find the '([^']+)' column/i) ||
        error.message?.match(/column "([^"]+)" of relation "profiles" does not exist/i)

      if (match && match[1] && match[1] in payloadToWrite) {
        const missingCol = match[1]
        console.warn(`[profile PUT] Stripping unmigrated column '${missingCol}' and retrying`)
        delete payloadToWrite[missingCol]
        continue
      }

      break
    }

    if (lastError) {
      console.error('Update profile error:', lastError)
      return NextResponse.json({ error: lastError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedProfile,
        avatar: updatedProfile?.avatar_url || updatedProfile?.avatar,
      },
    })
  } catch (err: any) {
    console.error('Profile update catch error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
