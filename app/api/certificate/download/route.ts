import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateCertificatePDF } from '@/lib/certificates/generatePdf'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')

  if (!courseId) {
    return new NextResponse('Missing courseId', { status: 400 })
  }

  /* ===============================
     1️⃣ AUTH VIA BEARER TOKEN
  =============================== */
  const authHeader = req.headers.get('authorization')

  if (!authHeader) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token)

  if (!user || error) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  /* ===============================
     2️⃣ SERVICE ROLE (DB CHECK)
  =============================== */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: progress } = await admin
    .from('student_capstone_progress')
    .select('certificate_issued')
    .eq('student_id', user.id)
    .eq('capstone_id', courseId)
    .maybeSingle()

  if (!progress?.certificate_issued) {
    return new NextResponse('Certificate not issued', { status: 403 })
  }



  /* ===============================
   FETCH STUDENT NAME
================================ */
const { data: profile } = await admin
.from('student_profiles')
.select('name')
.eq('id', user.id)
.single()

const studentName = profile?.name ?? user.email!

/* ===============================
 FETCH COURSE NAME
================================ */
const { data: course } = await admin
.from('courses')
.select('title')
.eq('id', courseId)
.single()

const courseName = course?.title ?? 'Capstone Project'

  /* ===============================
     3️⃣ GENERATE PDF
  =============================== */
  const pdfBuffer = await generateCertificatePDF({
    studentName,
    courseName,
    issueDate: new Date().toDateString(),
    certificateId: `${user.id}-${courseId}`,
  })
  
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=certificate.pdf',
    },
  })
}
