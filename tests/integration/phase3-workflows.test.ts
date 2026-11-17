import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, before, describe, it } from 'node:test'
import { and, eq, inArray } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/server'

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim()

if (testDatabaseUrl) {
  const host = new URL(testDatabaseUrl).hostname
  const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'postgres'])
  if (!localHosts.has(host) && process.env.ALLOW_REMOTE_TEST_DB !== '1') {
    throw new Error(
      `Refusing to run destructive integration tests against ${host}. ` +
        'Set ALLOW_REMOTE_TEST_DB=1 only for an isolated CI database.'
    )
  }
  process.env.DATABASE_URL = testDatabaseUrl
}

async function loadServices() {
  const { db } = await import('@/lib/db')
  const schema = await import('@/lib/db/schema')
  const assignmentService = await import('@/lib/services/assignment-service')
  const projectService = await import('@/lib/services/project-service')
  const certificateService = await import('@/lib/services/certificate-service')
  const notificationService = await import('@/lib/services/notification-service')
  return { db, schema, assignmentService, projectService, certificateService, notificationService }
}

type Services = Awaited<ReturnType<typeof loadServices>>

const skip = testDatabaseUrl
  ? false
  : 'TEST_DATABASE_URL is not set; run `npm run test:db:setup` against a dedicated database'

describe('Phase 3 assignment and project workflows', { skip }, () => {
  let services: Services
  let teacher: AuthContext
  let student: AuthContext
  let companyId: string
  let courseId: string
  let capstoneId: string
  let studentProfileId: string
  const userIds: string[] = []
  const profileIds: string[] = []
  const createdAssignmentIds: string[] = []
  const createdTemplateIds: string[] = []

  before(async () => {
    services = await loadServices()
    const { db, schema } = services

    companyId = randomUUID()
    courseId = randomUUID()
    capstoneId = randomUUID()

    const teacherUserId = randomUUID()
    const studentUserId = randomUUID()
    const teacherProfileId = randomUUID()
    studentProfileId = randomUUID()
    userIds.push(teacherUserId, studentUserId)
    profileIds.push(teacherProfileId, studentProfileId)

    await db.insert(schema.companies).values({
      id: companyId,
      name: 'Integration Test Company',
      slug: `integration-${companyId.slice(0, 8)}`,
    })

    await db.insert(schema.users).values([
      {
        id: teacherUserId,
        username: `teacher_${teacherUserId.slice(0, 8)}`,
        email: `teacher_${teacherUserId.slice(0, 8)}@example.test`,
        passwordHash: 'test-only',
        role: 'teacher',
      },
      {
        id: studentUserId,
        username: `student_${studentUserId.slice(0, 8)}`,
        email: `student_${studentUserId.slice(0, 8)}@example.test`,
        passwordHash: 'test-only',
        role: 'student',
      },
    ])

    await db.insert(schema.profiles).values([
      {
        id: teacherProfileId,
        userId: teacherUserId,
        companyId,
        name: 'Integration Instructor',
        fullName: 'Integration Instructor',
        email: `teacher_${teacherUserId.slice(0, 8)}@example.test`,
        role: 'teacher',
      },
      {
        id: studentProfileId,
        userId: studentUserId,
        companyId,
        name: 'Integration Student',
        fullName: 'Integration Student',
        email: `student_${studentUserId.slice(0, 8)}@example.test`,
        role: 'student',
      },
    ])

    await db.insert(schema.courses).values([
      {
        id: courseId,
        teacherId: teacherProfileId,
        companyId,
        title: 'Integration Test Course',
        subtitle: 'Phase 3 integration coverage',
        status: 'published',
        isCapstone: false,
        certificateEnabled: true,
      },
      {
        id: capstoneId,
        teacherId: teacherProfileId,
        companyId,
        title: 'Integration Test Capstone',
        status: 'published',
        isCapstone: false,
        parentCourseId: courseId,
        certificateEnabled: true,
      },
    ])

    // The legacy live database has an AFTER INSERT trigger that tries to
    // re-insert capstone courses through a view. Flip the flag after insert.
    await db
      .update(schema.courses)
      .set({ isCapstone: true })
      .where(eq(schema.courses.id, capstoneId))

    await db.insert(schema.courseEnrollments).values({
      studentId: studentProfileId,
      courseId,
      companyId,
      status: 'active',
      courseTitle: 'Integration Test Course',
    })

    await db.insert(schema.entitlements).values({
      studentId: studentProfileId,
      courseId,
      companyId,
      source: 'test',
      status: 'active',
    })

    await db.insert(schema.studentCapstoneProgress).values({
      studentId: studentProfileId,
      capstoneId,
      stage1Submitted: true,
      stage1Approved: true,
      stage2Submitted: true,
      stage2Approved: true,
      stage3Submitted: true,
      stage3Approved: true,
      completed: true,
    })

    teacher = {
      userId: teacherUserId,
      sessionId: 'integration-test-session',
      user: {
        id: teacherUserId,
        username: 'integration_teacher',
        email: 'teacher@example.test',
        role: 'teacher',
        status: 'active',
      },
      profile: {
        id: teacherProfileId,
        user_id: teacherUserId,
        company_id: companyId,
        username: 'integration_teacher',
        name: 'Integration Instructor',
        email: 'teacher@example.test',
        role: 'teacher',
      },
      role: 'teacher',
      companies: [
        { id: companyId, name: 'Integration Test Company', slug: 'integration', role: 'instructor' },
      ],
      permissions: [],
    }

    student = {
      userId: studentUserId,
      sessionId: 'integration-test-session',
      user: {
        id: studentUserId,
        username: 'integration_student',
        email: 'student@example.test',
        role: 'student',
        status: 'active',
      },
      profile: {
        id: studentProfileId,
        user_id: studentUserId,
        company_id: companyId,
        username: 'integration_student',
        name: 'Integration Student',
        email: 'student@example.test',
        role: 'student',
      },
      role: 'student',
      companies: [
        { id: companyId, name: 'Integration Test Company', slug: 'integration', role: 'student' },
      ],
      permissions: [],
    }
  })

  after(async () => {
    if (!services || !companyId || profileIds.length === 0) return
    const { db, schema } = services

    if (createdAssignmentIds.length > 0) {
      await db.delete(schema.assignments).where(inArray(schema.assignments.id, createdAssignmentIds))
    }
    if (createdTemplateIds.length > 0) {
      await db
        .delete(schema.projectTemplates)
        .where(inArray(schema.projectTemplates.id, createdTemplateIds))
    }

    await db.delete(schema.notifications).where(inArray(schema.notifications.profileId, profileIds))
    await db
      .delete(schema.auditLogs)
      .where(inArray(schema.auditLogs.actorProfileId, profileIds))
    await db
      .delete(schema.courseEnrollments)
      .where(eq(schema.courseEnrollments.studentId, studentProfileId))
    await db.delete(schema.entitlements).where(eq(schema.entitlements.studentId, studentProfileId))
    await db
      .delete(schema.studentCapstoneProgress)
      .where(eq(schema.studentCapstoneProgress.studentId, studentProfileId))
    if (courseId && capstoneId) {
      await db.delete(schema.courses).where(inArray(schema.courses.id, [courseId, capstoneId]))
    }
    await db.delete(schema.profiles).where(inArray(schema.profiles.id, profileIds))
    await db.delete(schema.userSessions).where(inArray(schema.userSessions.userId, userIds))
    await db.delete(schema.users).where(inArray(schema.users.id, userIds))
    await db.delete(schema.companyMemberships).where(eq(schema.companyMemberships.companyId, companyId))
    await db.delete(schema.companies).where(eq(schema.companies.id, companyId))
  })

  it('builds, submits, and reviews an assignment, then clears the certificate blocker', async () => {
    const { assignmentService, certificateService } = services
    const { db, schema } = services

    const assignment = await assignmentService.createAssignment(teacher, courseId, {
      title: 'Integration assignment',
      instructions: 'Submit a short implementation summary.',
      dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      submissionTypes: ['text'],
      isRequired: true,
    })
    createdAssignmentIds.push(assignment.id)

    const rubric = await assignmentService.upsertRubric(teacher, assignment.id, {
      criteria: [{ title: 'Quality', maxPoints: 10 }],
    })
    assert.ok(rubric && rubric.criteria.length === 1)

    const published = await assignmentService.publishAssignment(teacher, assignment.id)
    assert.equal(published.status, 'published')

    const beforeReview = await certificateService.getCertificateReadiness(
      student.profile.id,
      capstoneId
    )
    assert.equal(beforeReview.requirementsMet, false)
    assert.ok(
      beforeReview.blockers.some(
        (blocker) => blocker.type === 'assignment' && blocker.id === assignment.id
      )
    )

    const submission = await assignmentService.submitAssignment(student, assignment.id, {
      content: 'Implementation summary',
    })

    const teacherNotifications = await db
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.profileId, teacher.profile.id),
          eq(schema.notifications.type, 'assignment_submitted')
        )
      )
    assert.equal(teacherNotifications.length, 1)

    const queue = await assignmentService.listReviewQueue(teacher)
    assert.ok(queue.some((row) => row.submissionId === submission.id))

    await assignmentService.reviewSubmission(teacher, submission.id, {
      decision: 'approved',
      overallFeedback: 'Looks good',
      scores: [{ criterionId: rubric.criteria[0].id, points: 9 }],
    })

    const detail = await assignmentService.getStudentAssignment(student, assignment.id)
    assert.equal(detail.submissions[0].status, 'approved')
    assert.equal(detail.canSubmit, false)

    const afterReview = await certificateService.getCertificateReadiness(
      student.profile.id,
      capstoneId
    )
    assert.equal(afterReview.assignments.required, 1)
    assert.equal(afterReview.assignments.approved, 1)
    assert.ok(
      !afterReview.blockers.some(
        (blocker) => blocker.type === 'assignment' && blocker.id === assignment.id
      )
    )

    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.profileId, student.profile.id),
          eq(schema.notifications.type, 'assignment_reviewed')
        )
      )
    assert.equal(notifications.length, 1)
  })

  it('runs a project through milestones, unlocks the next step, and completes it', async () => {
    const { projectService, certificateService, notificationService } = services
    const { db, schema } = services

    const template = await projectService.createTemplate(teacher, courseId, {
      title: 'Integration project template',
      description: 'Milestone workflow coverage',
    })
    createdTemplateIds.push(template.id)

    const phase = await projectService.addPhase(teacher, template.id, {
      title: 'Build',
    })

    const firstMilestone = await projectService.addMilestone(teacher, phase.id, {
      title: 'Milestone one',
      dueOffsetDays: 1,
      isRequired: true,
    })
    await projectService.addMilestone(teacher, phase.id, {
      title: 'Milestone two',
      dueOffsetDays: 5,
      isRequired: true,
    })

    const published = await projectService.publishTemplate(teacher, template.id)
    assert.equal(published.status, 'published')

    const instance = await projectService.startProject(student, template.id)
    assert.equal(instance.status, 'active')

    const blocked = await certificateService.getCertificateReadiness(
      student.profile.id,
      capstoneId
    )
    assert.equal(blocked.milestones.required, 2)
    assert.equal(blocked.milestones.approved, 0)
    assert.equal(blocked.requirementsMet, false)

    const dueNotifications = await notificationService.listNotifications(student.profile.id)
    assert.ok(
      dueNotifications.notifications.some(
        (notification) => notification.type === 'project_milestone_due_soon'
      )
    )

    const detail = await projectService.getStudentProject(student, instance.id)
    const firstInstanceMilestone = detail.phases
      .flatMap((projectPhase) => projectPhase.milestones)
      .find((milestone) => milestone.id === firstMilestone.id)?.instanceMilestone
    assert.ok(firstInstanceMilestone)
    assert.equal(firstInstanceMilestone.status, 'available')

    const firstSubmission = await projectService.submitMilestone(
      student,
      firstInstanceMilestone.id,
      { content: 'Milestone one submitted' }
    )

    const teacherNotifications = await db
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.profileId, teacher.profile.id),
          eq(schema.notifications.type, 'project_milestone_submitted')
        )
      )
    assert.equal(teacherNotifications.length, 1)

    const queue = await projectService.listProjectReviewQueue(teacher)
    assert.ok(queue.some((row) => row.submissionId === firstSubmission.id))

    await projectService.reviewMilestone(teacher, firstSubmission.id, {
      decision: 'approved',
      feedback: 'Next milestone unlocked',
    })

    const afterFirstReview = await projectService.getStudentProject(student, instance.id)
    const milestonesAfterFirst = afterFirstReview.phases.flatMap(
      (projectPhase) => projectPhase.milestones
    )
    assert.equal(
      milestonesAfterFirst.find((milestone) => milestone.id === firstMilestone.id)?.instanceMilestone
        ?.status,
      'approved'
    )
    const secondInstanceMilestone = milestonesAfterFirst.find(
      (milestone) => milestone.id !== firstMilestone.id
    )?.instanceMilestone
    assert.ok(secondInstanceMilestone)
    assert.equal(secondInstanceMilestone.status, 'available')

    const secondSubmission = await projectService.submitMilestone(
      student,
      secondInstanceMilestone.id,
      { content: 'Milestone two submitted' }
    )
    await projectService.reviewMilestone(teacher, secondSubmission.id, {
      decision: 'approved',
    })

    const board = await projectService.listStudentProjects(student)
    const completed = board.projects.find((project) => project.id === instance.id)
    assert.ok(completed)
    assert.equal(completed.status, 'completed')
    assert.equal(completed.progress, 100)

    const ready = await certificateService.getCertificateReadiness(
      student.profile.id,
      capstoneId
    )
    assert.equal(ready.assignments.approved, ready.assignments.required)
    assert.equal(ready.milestones.approved, ready.milestones.required)
    assert.equal(ready.requirementsMet, true)
    assert.equal(ready.ready, true)

    const notifications = await notificationService.listNotifications(student.profile.id)
    assert.ok(
      notifications.notifications.some(
        (notification) => notification.type === 'project_milestone_reviewed'
      )
    )
  })

  it('creates deduplicated due-soon and overdue assignment notifications', async () => {
    const { assignmentService, notificationService } = services
    const { db, schema } = services

    async function createPublishedAssignment(title: string, dueAt: Date) {
      const assignment = await assignmentService.createAssignment(teacher, courseId, {
        title,
        instructions: 'Notification coverage',
        dueAt: dueAt.toISOString(),
        submissionTypes: ['text'],
        isRequired: false,
      })
      createdAssignmentIds.push(assignment.id)
      await assignmentService.upsertRubric(teacher, assignment.id, {
        criteria: [{ title: 'Completion', maxPoints: 5 }],
      })
      await assignmentService.publishAssignment(teacher, assignment.id)
      return assignment
    }

    const overdue = await createPublishedAssignment(
      'Overdue notification assignment',
      new Date(Date.now() - 86400000)
    )
    const dueSoon = await createPublishedAssignment(
      'Due soon notification assignment',
      new Date(Date.now() + 86400000)
    )

    await notificationService.listNotifications(student.profile.id)
    await notificationService.listNotifications(student.profile.id)

    const bulkSync = await notificationService.syncDueNotificationsForAll()
    assert.ok(bulkSync.candidates >= 2)

    const rows = await db
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.profileId, student.profile.id),
          inArray(schema.notifications.type, [
            'assignment_due_soon',
            'assignment_overdue',
          ])
        )
      )

    assert.equal(
      rows.filter((row) => row.type === 'assignment_overdue').length,
      1,
      'overdue notification should be deduplicated'
    )
    assert.ok(
      rows.some(
        (row) =>
          row.type === 'assignment_due_soon' &&
          row.metadata &&
          (row.metadata as Record<string, unknown>).assignmentId === dueSoon.id
      )
    )
    assert.ok(
      rows.some(
        (row) =>
          row.type === 'assignment_overdue' &&
          row.metadata &&
          (row.metadata as Record<string, unknown>).assignmentId === overdue.id
      )
    )
  })

  it('reports assignment and project counts for dashboards', async () => {
    const { assignmentService, projectService } = services

    const assignments = await assignmentService.listStudentAssignments(student)
    assert.ok(assignments.length >= 3)
    assert.ok(assignments.some((assignment) => assignment.isOverdue))

    const board = await projectService.listStudentProjects(student)
    assert.ok(board.projects.length >= 1)
    assert.ok(board.projects.some((project) => project.status === 'completed'))
    const completed = board.projects.find((project) => project.status === 'completed')
    assert.ok(completed)
    assert.equal(completed.totalMilestones, 2)
    assert.equal(completed.approvedMilestones, 2)
  })
})
