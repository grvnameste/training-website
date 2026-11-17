<<<<<<< HEAD
import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { certificates, profiles, studentCapstoneProgress } from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, getClientIp, getUserAgent, parseJson } from '@/lib/http/request'
import {
  badRequest,
  conflict,
  notFound,
  toErrorResponse,
} from '@/lib/http/errors'
import {
  assertCourseManage,
  hasCourseEntitlement,
} from '@/lib/services/course-access-service'
import { getCertificateReadiness } from '@/lib/services/certificate-service'
import { recordAudit } from '@/lib/services/audit-service'

const bodySchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid certificate request', parsed.error.flatten())
    }

    const { studentId, courseId } = parsed.data
    const capstone = await assertCourseManage(authResult.context, courseId)

    if (!(await hasCourseEntitlement(studentId, capstone))) {
      throw notFound('Student is not entitled to this capstone')
    }

    const [progress] = await db
      .select()
      .from(studentCapstoneProgress)
      .where(
        and(
          eq(studentCapstoneProgress.studentId, studentId),
          eq(studentCapstoneProgress.capstoneId, courseId)
        )
      )
      .limit(1)

    if (!progress) throw notFound('Capstone progress not found')
    if (!progress.completed) {
      throw conflict('CAPSTONE_INCOMPLETE', 'Capstone is not completed yet')
    }
    if (progress.certificateIssued) {
      throw conflict('CERTIFICATE_ALREADY_ISSUED', 'Certificate already issued')
    }

    const readiness = await getCertificateReadiness(studentId, courseId)
    if (!readiness.certificateEnabled) {
      throw conflict('CERTIFICATE_DISABLED', 'Certificates are disabled for this course')
    }
    if (!readiness.requirementsMet) {
      throw conflict(
        'CERTIFICATE_REQUIREMENTS_INCOMPLETE',
        'Required assignments and project milestones must be approved before issuing a certificate',
        {
          blockers: readiness.blockers,
          assignments: readiness.assignments,
          milestones: readiness.milestones,
        }
      )
    }

    const [student] = await db
      .select({ name: profiles.name, fullName: profiles.fullName })
      .from(profiles)
      .where(eq(profiles.id, studentId))
      .limit(1)

    if (!student) throw notFound('Student not found')

    await db.transaction(async (tx) => {
      await tx
        .insert(certificates)
        .values({
          studentId,
          courseId,
          studentName: student.name || student.fullName || 'Student',
          courseName: capstone.title,
        })
        .onConflictDoNothing({
          target: [certificates.studentId, certificates.courseId],
        })

      await tx
        .update(studentCapstoneProgress)
        .set({ certificateIssued: true, certificateRequested: false })
        .where(eq(studentCapstoneProgress.id, progress.id))
    })

    await recordAudit(authResult.context, {
      action: 'certificate.issued',
      resourceType: 'capstone',
      resourceId: courseId,
      companyId: capstone.companyId,
      metadata: { studentId },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
=======
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
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
