//app/api/certificate/issue/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, courseId, studentName, courseName } = body

    console.log('REQ BODY:', body)

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Missing studentId or courseId' },
        { status: 400 }
      )
    }

    /* ===============================
       1️⃣ AUTH (Bearer Token)
    =============================== */
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {
      data: { user },
      error: authErr,
    } = await supabaseAuth.auth.getUser(token)

    console.log('AUTH USER:', user)

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    /* ===============================
       2️⃣ CHECK TEACHER ROLE
    =============================== */
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('PROFILE:', profile)
    if (!profile || !['teacher','super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    /* ===============================
       3️⃣ CHECK CAPSTONE STATUS
    =============================== */
    const { data: progress, error: progressErr } = await admin
      .from('student_capstone_progress')
      .select('completed, certificate_issued')
      .eq('student_id', studentId)
      .eq('capstone_id', courseId)
      .maybeSingle()

    console.log('PROGRESS:', progress)

    if (progressErr) {
      return NextResponse.json({ error: progressErr.message }, { status: 500 })
    }

    if (!progress || !progress.completed) {
      return NextResponse.json(
        { error: 'Capstone not approved yet' },
        { status: 403 }
      )
    }

    if (progress.certificate_issued) {
      return NextResponse.json(
        { error: 'Certificate already issued' },
        { status: 400 }
      )
    }

    /* ===============================
       4️⃣ INSERT CERTIFICATE
    =============================== */
    const { error: certErr } = await admin.from('certificates').insert({
      student_id: studentId,
      course_id: courseId,
      student_name: studentName,
      course_name: courseName,
    })

    if (certErr) {
      console.log('CERT ERROR:', certErr)
      return NextResponse.json({ error: certErr.message }, { status: 500 })
    }

    /* ===============================
       5️⃣ UPDATE PROGRESS
    =============================== */
    await admin
      .from('student_capstone_progress')
      .update({
        certificate_issued: true,
        certificate_requested: false,
      })
      .eq('student_id', studentId)
      .eq('capstone_id', courseId)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('CERT ISSUE ERROR:', e)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
