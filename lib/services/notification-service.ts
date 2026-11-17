import { and, asc, desc, eq, inArray, isNotNull, lt, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  assignmentSubmissions,
  assignments,
  courseEnrollments,
  notifications,
  projectInstanceMilestones,
  projectInstances,
  projectMilestones,
} from '@/lib/db/schema'

export interface NotificationInput {
  profileId: string
  type: string
  title: string
  body?: string | null
  linkUrl?: string | null
  dedupeKey?: string | null
  metadata?: Record<string, unknown>
}

export async function createNotification(input: NotificationInput) {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        profileId: input.profileId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        linkUrl: input.linkUrl ?? null,
        dedupeKey: input.dedupeKey ?? null,
        metadata: input.metadata ?? {},
      })
      .onConflictDoNothing()
      .returning()
    return notification ?? null
  } catch (error) {
    console.error('[notifications] create failed:', error)
    return null
  }
}

export async function createNotificationsForProfiles(
  profileIds: string[],
  input: Omit<NotificationInput, 'profileId'>
) {
  const uniqueIds = [...new Set(profileIds)]
  await Promise.all(
    uniqueIds.map((profileId) => createNotification({ ...input, profileId }))
  )
}

export async function notifyCourseStudents(
  courseId: string,
  input: Omit<NotificationInput, 'profileId'>
) {
  const rows = await db
    .select({ studentId: courseEnrollments.studentId })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.courseId, courseId))
  await createNotificationsForProfiles(
    rows.map((row) => row.studentId),
    input
  )
}

async function insertNotificationsBulk(inputs: NotificationInput[]) {
  const unique = new Map<string, NotificationInput>()
  for (const input of inputs) {
    const key = `${input.profileId}:${input.dedupeKey ?? input.title}`
    if (!unique.has(key)) unique.set(key, input)
  }
  const rows = [...unique.values()]
  if (rows.length === 0) return 0

  for (let index = 0; index < rows.length; index += 500) {
    const chunk = rows.slice(index, index + 500)
    try {
      await db
        .insert(notifications)
        .values(
          chunk.map((input) => ({
            profileId: input.profileId,
            type: input.type,
            title: input.title,
            body: input.body ?? null,
            linkUrl: input.linkUrl ?? null,
            dedupeKey: input.dedupeKey ?? null,
            metadata: input.metadata ?? {},
          }))
        )
        .onConflictDoNothing()
    } catch (error) {
      console.error('[notifications] bulk create failed:', error)
    }
  }
  return rows.length
}

const SUBMISSION_FINISHED_STATUSES = new Set([
  'approved',
  'graded',
  'submitted',
  'under_review',
])

export async function syncDueNotificationsForAll() {
  const now = new Date()
  const soon = new Date(now.getTime() + 3 * 86400000)
  const pending: NotificationInput[] = []

  const assignmentRows = await db
    .select({
      id: assignments.id,
      courseId: assignments.courseId,
      title: assignments.title,
      dueAt: assignments.dueAt,
    })
    .from(assignments)
    .where(
      and(
        eq(assignments.status, 'published'),
        isNotNull(assignments.dueAt),
        lte(assignments.dueAt, soon)
      )
    )

  if (assignmentRows.length > 0) {
    const assignmentIds = assignmentRows.map((row) => row.id)
    const courseIds = [...new Set(assignmentRows.map((row) => row.courseId))]
    const [enrollments, submissions] = await Promise.all([
      db
        .select({
          studentId: courseEnrollments.studentId,
          courseId: courseEnrollments.courseId,
        })
        .from(courseEnrollments)
        .where(inArray(courseEnrollments.courseId, courseIds)),
      db
        .select({
          assignmentId: assignmentSubmissions.assignmentId,
          studentId: assignmentSubmissions.studentId,
          attempt: assignmentSubmissions.attempt,
          status: assignmentSubmissions.status,
        })
        .from(assignmentSubmissions)
        .where(inArray(assignmentSubmissions.assignmentId, assignmentIds))
        .orderBy(desc(assignmentSubmissions.attempt)),
    ])

    const latestByStudentAssignment = new Map<
      string,
      (typeof submissions)[number]
    >()
    for (const submission of submissions) {
      const key = `${submission.studentId}:${submission.assignmentId}`
      if (!latestByStudentAssignment.has(key)) {
        latestByStudentAssignment.set(key, submission)
      }
    }

    const assignmentsByCourse = new Map<string, typeof assignmentRows>()
    for (const assignment of assignmentRows) {
      const list = assignmentsByCourse.get(assignment.courseId) ?? []
      list.push(assignment)
      assignmentsByCourse.set(assignment.courseId, list)
    }

    for (const enrollment of enrollments) {
      for (const assignment of assignmentsByCourse.get(enrollment.courseId) ?? []) {
        if (!assignment.dueAt) continue
        const latest = latestByStudentAssignment.get(
          `${enrollment.studentId}:${assignment.id}`
        )
        if (latest && SUBMISSION_FINISHED_STATUSES.has(latest.status)) continue

        const overdue = assignment.dueAt.getTime() < now.getTime()
        pending.push({
          profileId: enrollment.studentId,
          type: overdue ? 'assignment_overdue' : 'assignment_due_soon',
          title: overdue ? 'Assignment overdue' : 'Assignment due soon',
          body: `${assignment.title} ${
            overdue ? 'is past its due date' : 'is due within 3 days'
          }.`,
          linkUrl: `/student/assignments/${assignment.id}`,
          dedupeKey: `assignment:${assignment.id}:${overdue ? 'overdue' : 'due'}`,
          metadata: { assignmentId: assignment.id },
        })
      }
    }
  }

  const milestoneRows = await db
    .select({
      studentId: projectInstances.studentId,
      instanceId: projectInstances.id,
      instanceMilestoneId: projectInstanceMilestones.id,
      dueAt: projectInstanceMilestones.dueAt,
      status: projectInstanceMilestones.status,
      milestoneTitle: projectMilestones.title,
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
    .where(
      and(
        eq(projectInstances.status, 'active'),
        inArray(projectInstanceMilestones.status, ['available', 'changes_requested']),
        isNotNull(projectInstanceMilestones.dueAt),
        lte(projectInstanceMilestones.dueAt, soon)
      )
    )

  for (const milestone of milestoneRows) {
    if (!milestone.dueAt) continue
    const overdue = milestone.dueAt.getTime() < now.getTime()
    pending.push({
      profileId: milestone.studentId,
      type: overdue ? 'project_milestone_overdue' : 'project_milestone_due_soon',
      title: overdue ? 'Project milestone overdue' : 'Project milestone due soon',
      body: `${milestone.milestoneTitle} ${
        overdue ? 'is past its due date' : 'is due within 3 days'
      }.`,
      linkUrl: `/student/projects/${milestone.instanceId}`,
      dedupeKey: `project-milestone:${milestone.instanceMilestoneId}:${
        overdue ? 'overdue' : 'due'
      }`,
      metadata: {
        instanceId: milestone.instanceId,
        instanceMilestoneId: milestone.instanceMilestoneId,
      },
    })
  }

  const created = await insertNotificationsBulk(pending)
  return { candidates: pending.length, created }
}

export async function syncDueNotifications(profileId: string) {
  try {
    const now = new Date()
    const soon = new Date(now.getTime() + 3 * 86400000)

    const enrolled = await db
      .select({ courseId: courseEnrollments.courseId })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.studentId, profileId))
    const courseIds = enrolled.map((row) => row.courseId)

    if (courseIds.length > 0) {
      const assignmentRows = await db
        .select({
          id: assignments.id,
          title: assignments.title,
          dueAt: assignments.dueAt,
        })
        .from(assignments)
        .where(
          and(
            eq(assignments.status, 'published'),
            inArray(assignments.courseId, courseIds),
            lte(assignments.dueAt, soon)
          )
        )

      const assignmentIds = assignmentRows.map((row) => row.id)
      const submissions = assignmentIds.length
        ? await db
            .select({
              assignmentId: assignmentSubmissions.assignmentId,
              attempt: assignmentSubmissions.attempt,
              status: assignmentSubmissions.status,
            })
            .from(assignmentSubmissions)
            .where(
              and(
                eq(assignmentSubmissions.studentId, profileId),
                inArray(assignmentSubmissions.assignmentId, assignmentIds)
              )
            )
            .orderBy(desc(assignmentSubmissions.attempt))
        : []

      for (const assignment of assignmentRows) {
        if (!assignment.dueAt) continue
        const latest = submissions.find(
          (submission) => submission.assignmentId === assignment.id
        )
        if (latest && (latest.status === 'approved' || latest.status === 'graded')) {
          continue
        }
        if (latest && (latest.status === 'submitted' || latest.status === 'under_review')) {
          continue
        }
        const overdue = assignment.dueAt.getTime() < now.getTime()
        await createNotification({
          profileId,
          type: overdue ? 'assignment_overdue' : 'assignment_due_soon',
          title: overdue ? 'Assignment overdue' : 'Assignment due soon',
          body: `${assignment.title} ${
            overdue ? 'is past its due date' : 'is due within 3 days'
          }.`,
          linkUrl: `/student/assignments/${assignment.id}`,
          dedupeKey: `assignment:${assignment.id}:${overdue ? 'overdue' : 'due'}`,
          metadata: { assignmentId: assignment.id },
        })
      }
    }

    const projectRows = await db
      .select({
        instanceId: projectInstances.id,
        instanceMilestoneId: projectInstanceMilestones.id,
        dueAt: projectInstanceMilestones.dueAt,
        status: projectInstanceMilestones.status,
        milestoneTitle: projectMilestones.title,
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
      .where(
        and(
          eq(projectInstances.studentId, profileId),
          eq(projectInstances.status, 'active'),
          inArray(projectInstanceMilestones.status, ['available', 'changes_requested']),
          lte(projectInstanceMilestones.dueAt, soon)
        )
      )

    for (const milestone of projectRows) {
      if (!milestone.dueAt) continue
      const overdue = milestone.dueAt.getTime() < now.getTime()
      await createNotification({
        profileId,
        type: overdue ? 'project_milestone_overdue' : 'project_milestone_due_soon',
        title: overdue ? 'Project milestone overdue' : 'Project milestone due soon',
        body: `${milestone.milestoneTitle} ${
          overdue ? 'is past its due date' : 'is due within 3 days'
        }.`,
        linkUrl: `/student/projects/${milestone.instanceId}`,
        dedupeKey: `project-milestone:${milestone.instanceMilestoneId}:${
          overdue ? 'overdue' : 'due'
        }`,
        metadata: {
          instanceId: milestone.instanceId,
          instanceMilestoneId: milestone.instanceMilestoneId,
        },
      })
    }
  } catch (error) {
    console.error('[notifications] due sync failed:', error)
  }
}

export async function listNotifications(profileId: string) {
  try {
    await syncDueNotifications(profileId)

    const [rows, unread] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(eq(notifications.profileId, profileId))
        .orderBy(desc(notifications.createdAt))
        .limit(50),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(
          and(
            eq(notifications.profileId, profileId),
            sql`${notifications.readAt} is null`
          )
        ),
    ])

    return {
      notifications: rows,
      unreadCount: unread[0]?.count ?? 0,
    }
  } catch (error) {
    console.error('[notifications] list failed:', error)
    return { notifications: [], unreadCount: 0 }
  }
}

export async function markNotificationRead(profileId: string, notificationId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.profileId, profileId))
    )
}

export async function markAllNotificationsRead(profileId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.profileId, profileId), sql`${notifications.readAt} is null`)
    )
}
