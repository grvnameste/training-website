import { and, eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  courses,
  profiles,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getCertificateReadiness } from '@/lib/services/certificate-service'

export async function GET() {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const isSuperAdmin = authResult.context.role === 'super_admin'
    const capstones = await db
      .select({ id: courses.id, title: courses.title })
      .from(courses)
      .where(
        isSuperAdmin
          ? eq(courses.isCapstone, true)
          : and(
              eq(courses.isCapstone, true),
              eq(courses.teacherId, authResult.context.profile.id)
            )
      )

    if (capstones.length === 0) return NextResponse.json({ pending: [] })

    const progressRows = await db
      .select()
      .from(studentCapstoneProgress)
      .where(
        and(
          inArray(
            studentCapstoneProgress.capstoneId,
            capstones.map((course) => course.id)
          ),
          eq(studentCapstoneProgress.certificateRequested, true),
          eq(studentCapstoneProgress.certificateIssued, false),
          eq(studentCapstoneProgress.stage3Submitted, true)
        )
      )

    if (progressRows.length === 0) return NextResponse.json({ pending: [] })

    const studentIds = [...new Set(progressRows.map((row) => row.studentId))]
    const studentRows = await db
      .select({ id: profiles.id, name: profiles.name, fullName: profiles.fullName })
      .from(profiles)
      .where(inArray(profiles.id, studentIds))

    const studentMap = new Map(
      studentRows.map((student) => [student.id, student.name || student.fullName || 'Student'])
    )
    const capstoneMap = new Map(capstones.map((course) => [course.id, course.title]))

    const readinessByRequest = new Map<
      string,
      Awaited<ReturnType<typeof getCertificateReadiness>> | null
    >()
    await Promise.all(
      progressRows.map(async (row) => {
        try {
          readinessByRequest.set(
            `${row.studentId}:${row.capstoneId}`,
            await getCertificateReadiness(row.studentId, row.capstoneId)
          )
        } catch {
          readinessByRequest.set(`${row.studentId}:${row.capstoneId}`, null)
        }
      })
    )

    return NextResponse.json({
      pending: progressRows.map((row) => {
        const readiness = readinessByRequest.get(`${row.studentId}:${row.capstoneId}`)
        return {
          student_id: row.studentId,
          capstone_id: row.capstoneId,
          student_name: studentMap.get(row.studentId) || 'Student',
          capstone_title: capstoneMap.get(row.capstoneId) || 'Capstone',
          stage3_submitted: row.stage3Submitted,
          certificate_requested: row.certificateRequested,
          completed: row.completed,
          certificate_issued: row.certificateIssued,
          readiness: readiness
            ? {
                readyToIssue: readiness.ready,
                requirementsMet: readiness.requirementsMet,
                certificateEnabled: readiness.certificateEnabled,
                capstoneCompleted: readiness.capstoneCompleted,
                assignments: {
                  required: readiness.assignments.required,
                  approved: readiness.assignments.approved,
                },
                milestones: {
                  required: readiness.milestones.required,
                  approved: readiness.milestones.approved,
                },
                blockers: readiness.blockers,
              }
            : null,
        }
      }),
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
