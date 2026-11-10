import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { studentId, courseId, studentName, courseName } = body

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ✅ CHECK TEACHER ROLE
    const { data: profile } = await admin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (!profile || !['teacher', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ✅ CHECK PROGRESS
    const { data: progress } = await admin
      .from('student_capstone_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('capstone_id', courseId)
      .maybeSingle()

    if (!progress || !progress.completed) {
      return NextResponse.json(
        { error: 'Capstone not approved yet' },
        { status: 403 }
      )
    }

    if (progress.certificate_issued) {
      return NextResponse.json(
        { error: 'Already issued' },
        { status: 400 }
      )
    }

    // ✅ INSERT CERTIFICATE
    const { error: certErr } = await admin.from('certificates').insert({
      student_id: studentId,
      course_id: courseId,
      student_name: studentName,
      course_name: courseName,
    })

    if (certErr) {
      return NextResponse.json({ error: certErr.message }, { status: 500 })
    }

    // ✅ UPDATE PROGRESS
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
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}