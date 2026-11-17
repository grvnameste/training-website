import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  assignmentSubmissions,
  assignments,
  projectInstanceMilestones,
  projectInstances,
  projectMilestones,
  projectTemplates,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import { notFound } from '@/lib/http/errors'
import { getCourseById } from './course-access-service'

export type CertificateBlocker = {
  type: 'assignment' | 'project_milestone'
  id: string
  title: string
  status: string | null
  dueAt: string | null
}

export type CertificateReadiness = {
  ready: boolean
  requirementsMet: boolean
  certificateEnabled: boolean
  capstoneCompleted: boolean
  courseIds: string[]
  assignments: {
    required: number
    approved: number
    pending: CertificateBlocker[]
  }
  milestones: {
    required: number
    approved: number
    pending: CertificateBlocker[]
  }
  blockers: CertificateBlocker[]
}

const APPROVED_SUBMISSION_STATUSES = new Set(['approved', 'graded'])

export async function getCertificateReadiness(
  studentId: string,
  courseId: string
): Promise<CertificateReadiness> {
  const course = await getCourseById(courseId)
  if (!course) throw notFound('Course not found')

  const courseIds = [course.id]
  if (course.isCapstone && course.parentCourseId) {
    courseIds.push(course.parentCourseId)
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

  const capstoneCompleted = Boolean(progress?.completed)

  const requiredAssignments = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      dueAt: assignments.dueAt,
    })
    .from(assignments)
    .where(
      and(
        inArray(assignments.courseId, courseIds),
        eq(assignments.status, 'published'),
        eq(assignments.isRequired, true)
      )
    )

  const assignmentIds = requiredAssignments.map((assignment) => assignment.id)
  const assignmentSubmissionsRows = assignmentIds.length
    ? await db
        .select({
          assignmentId: assignmentSubmissions.assignmentId,
          status: assignmentSubmissions.status,
          attempt: assignmentSubmissions.attempt,
        })
        .from(assignmentSubmissions)
        .where(
          and(
            eq(assignmentSubmissions.studentId, studentId),
            inArray(assignmentSubmissions.assignmentId, assignmentIds)
          )
        )
        .orderBy(desc(assignmentSubmissions.attempt))
    : []

  const latestSubmissionByAssignment = new Map<string, (typeof assignmentSubmissionsRows)[number]>()
  for (const submission of assignmentSubmissionsRows) {
    if (!latestSubmissionByAssignment.has(submission.assignmentId)) {
      latestSubmissionByAssignment.set(submission.assignmentId, submission)
    }
  }

  const pendingAssignments: CertificateBlocker[] = requiredAssignments
    .filter((assignment) => {
      const latest = latestSubmissionByAssignment.get(assignment.id)
      return !latest || !APPROVED_SUBMISSION_STATUSES.has(latest.status)
    })
    .map((assignment) => ({
      type: 'assignment' as const,
      id: assignment.id,
      title: assignment.title,
      status: latestSubmissionByAssignment.get(assignment.id)?.status ?? null,
      dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
    }))

  const milestoneRows = await db
    .select({
      instanceId: projectInstances.id,
      instanceStatus: projectInstances.status,
      templateStatus: projectTemplates.status,
      instanceMilestoneId: projectInstanceMilestones.id,
      status: projectInstanceMilestones.status,
      dueAt: projectInstanceMilestones.dueAt,
      title: projectMilestones.title,
    })
    .from(projectInstanceMilestones)
    .innerJoin(
      projectInstances,
      eq(projectInstances.id, projectInstanceMilestones.instanceId)
    )
    .innerJoin(
      projectMilestones,
      eq(projectMilestones.id, projectInstanceMilestones.milestoneId)
    )
    .innerJoin(projectTemplates, eq(projectTemplates.id, projectInstances.templateId))
    .where(
      and(
        eq(projectInstances.studentId, studentId),
        inArray(projectInstances.courseId, courseIds),
        eq(projectMilestones.isRequired, true)
      )
    )

  const requiredMilestones = milestoneRows.filter(
    (row) => row.instanceStatus !== 'archived' && row.templateStatus !== 'archived'
  )
  const pendingMilestones: CertificateBlocker[] = requiredMilestones
    .filter((row) => row.status !== 'approved')
    .map((row) => ({
      type: 'project_milestone' as const,
      id: row.instanceMilestoneId,
      title: row.title,
      status: row.status,
      dueAt: row.dueAt ? row.dueAt.toISOString() : null,
    }))

  const blockers = [...pendingAssignments, ...pendingMilestones]
  const requirementsMet = course.certificateEnabled && blockers.length === 0

  return {
    ready: requirementsMet && capstoneCompleted,
    requirementsMet,
    certificateEnabled: course.certificateEnabled,
    capstoneCompleted,
    courseIds,
    assignments: {
      required: requiredAssignments.length,
      approved: requiredAssignments.length - pendingAssignments.length,
      pending: pendingAssignments,
    },
    milestones: {
      required: requiredMilestones.length,
      approved: requiredMilestones.length - pendingMilestones.length,
      pending: pendingMilestones,
    },
    blockers,
  }
}
