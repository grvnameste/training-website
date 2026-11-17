import { and, eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  capstoneMeetings,
  courses,
  profiles,
  requirementDocuments,
  stage3Submissions,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'

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

    if (capstones.length === 0) return NextResponse.json({ items: [] })

    const capstoneIds = capstones.map((course) => course.id)
    const progressRows = await db
      .select()
      .from(studentCapstoneProgress)
      .where(inArray(studentCapstoneProgress.capstoneId, capstoneIds))

    const pending = progressRows.filter(
      (row) =>
        (row.stage1Submitted && !row.stage1Approved) ||
        (row.stage2Submitted && !row.stage2Approved) ||
        (row.stage3Submitted && !row.stage3Approved)
    )

    if (pending.length === 0) return NextResponse.json({ items: [] })

    const studentIds = [...new Set(pending.map((row) => row.studentId))]
    const [studentRows, requirements, stage3Files, meetings] = await Promise.all([
      db
        .select({ id: profiles.id, name: profiles.name, fullName: profiles.fullName })
        .from(profiles)
        .where(inArray(profiles.id, studentIds)),
      db
        .select()
        .from(requirementDocuments)
        .where(inArray(requirementDocuments.capstoneId, capstoneIds)),
      db
        .select()
        .from(stage3Submissions)
        .where(inArray(stage3Submissions.capstoneId, capstoneIds)),
      db
        .select()
        .from(capstoneMeetings)
        .where(inArray(capstoneMeetings.capstoneId, capstoneIds)),
    ])

    const studentMap = new Map(
      studentRows.map((student) => [student.id, student.name || student.fullName || 'Student'])
    )
    const capstoneMap = new Map(capstones.map((capstone) => [capstone.id, capstone.title]))

    const items = pending.map((progress) => {
      const currentStage = progress.stage1Submitted && !progress.stage1Approved
        ? 1
        : progress.stage2Submitted && !progress.stage2Approved
        ? 2
        : 3

      const requirement = requirements.find(
        (doc) =>
          doc.studentId === progress.studentId && doc.capstoneId === progress.capstoneId
      )
      const files = stage3Files.filter(
        (file) =>
          file.studentId === progress.studentId && file.capstoneId === progress.capstoneId
      )
      const meeting = meetings.find(
        (item) =>
          item.studentId === progress.studentId && item.capstoneId === progress.capstoneId
      )

      return {
        progress_id: progress.id,
        student_id: progress.studentId,
        capstone_id: progress.capstoneId,
        title: capstoneMap.get(progress.capstoneId) || 'Capstone',
        student_name: studentMap.get(progress.studentId) || 'Student',
        current_stage: currentStage,
        requirement_url: requirement?.fileUrl ?? null,
        stage2_approved: progress.stage2Approved,
        stage3_approved: progress.stage3Approved,
        stage3_files: files.map((file) => ({
          id: file.id,
          file_name: file.fileName,
          file_url: file.fileUrl,
          approved: file.approved,
        })),
        meeting: meeting ?? null,
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    return toErrorResponse(error)
  }
}
