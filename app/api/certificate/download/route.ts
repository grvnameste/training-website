import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateCertificatePDF } from '@/lib/certificates/generatePdf'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')

  if (!courseId) {
    return new NextResponse('Missing courseId', { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ✅ GET STUDENT UUID
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!profile?.id) {
    return new NextResponse('Profile not found', { status: 404 })
  }

  const studentId = profile.id

  // ✅ CHECK CERTIFICATE
  const { data: progress } = await admin
    .from('student_capstone_progress')
    .select('certificate_issued')
    .eq('student_id', studentId)
    .eq('capstone_id', courseId)
    .maybeSingle()

  if (!progress?.certificate_issued) {
    return new NextResponse('Not issued', { status: 403 })
  }

  // ✅ GET NAME
  const { data: student } = await admin
    .from('student_profiles')
    .select('name')
    .eq('id', studentId)
    .single()

  const { data: course } = await admin
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single()

  const pdfBuffer = await generateCertificatePDF({
    studentName: student?.name ?? 'Student',
    courseName: course?.title ?? 'Capstone',
    issueDate: new Date().toDateString(),
    certificateId: `${studentId}-${courseId}`,
  })

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=certificate.pdf',
    },
  })
}