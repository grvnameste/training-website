import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  assignmentReviews,
  assignmentSubmissions,
  assignments,
  courseEnrollments,
  courses,
  profiles,
  reviewScores,
  rubricCriteria,
  rubrics,
  submissionFiles,
} from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import {
  badRequest,
  conflict,
  forbidden,
  notFound,
} from '@/lib/http/errors'
import {
  assertCourseManage,
  getCourseById,
  hasCourseEntitlement,
} from './course-access-service'
import { getLessonCourseId } from './progress-service'
import { recordAudit } from './audit-service'
import { createNotification } from './notification-service'

export interface AssignmentInput {
  title: string
  instructions: string
  dueAt?: string | null
  submissionTypes: string[]
  maxAttempts?: number
  isRequired?: boolean
  lessonId?: string | null
}

export interface RubricCriterionInput {
  title: string
  description?: string | null
  maxPoints: number
}

async function getAssignment(assignmentId: string) {
  const [assignment] = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1)
  return assignment ?? null
}

export async function assertAssignmentManage(ctx: AuthContext, assignmentId: string) {
  const assignment = await getAssignment(assignmentId)
  if (!assignment) throw notFound('Assignment not found')
  await assertCourseManage(ctx, assignment.courseId)
  return assignment
}

async function getRubricWithCriteria(assignmentId: string) {
  const [rubric] = await db
    .select()
    .from(rubrics)
    .where(eq(rubrics.assignmentId, assignmentId))
    .limit(1)

  if (!rubric) return null

  const criteria = await db
    .select()
    .from(rubricCriteria)
    .where(eq(rubricCriteria.rubricId, rubric.id))
    .orderBy(asc(rubricCriteria.position))

  return { ...rubric, criteria }
}

async function validateLesson(courseId: string, lessonId?: string | null) {
  if (!lessonId) return
  const lessonCourseId = await getLessonCourseId(lessonId)
  if (lessonCourseId !== courseId) {
    throw badRequest('Lesson does not belong to this course')
  }
}

export async function listInstructorAssignments(ctx: AuthContext, courseId: string) {
  await assertCourseManage(ctx, courseId)

  const assignmentRows = await db
    .select({
      id: assignments.id,
      courseId: assignments.courseId,
      title: assignments.title,
      dueAt: assignments.dueAt,
      status: assignments.status,
      maxAttempts: assignments.maxAttempts,
      isRequired: assignments.isRequired,
      createdAt: assignments.createdAt,
      rubricId: rubrics.id,
      submissionCount: sql<number>`(
        select count(*)::int from ${assignmentSubmissions}
        where ${assignmentSubmissions.assignmentId} = ${assignments.id}
      )`,
      pendingCount: sql<number>`(
        select count(*)::int from ${assignmentSubmissions}
        where ${assignmentSubmissions.assignmentId} = ${assignments.id}
          and ${assignmentSubmissions.status} in ('submitted','under_review')
      )`,
    })
    .from(assignments)
    .leftJoin(rubrics, eq(rubrics.assignmentId, assignments.id))
    .where(eq(assignments.courseId, courseId))
    .orderBy(desc(assignments.createdAt))

  return assignmentRows
}

export async function createAssignment(
  ctx: AuthContext,
  courseId: string,
  input: AssignmentInput
) {
  await assertCourseManage(ctx, courseId)
  await validateLesson(courseId, input.lessonId)

  const [assignment] = await db
    .insert(assignments)
    .values({
      courseId,
      lessonId: input.lessonId ?? null,
      createdBy: ctx.profile.id,
      title: input.title,
      instructions: input.instructions,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      submissionTypes: input.submissionTypes.length ? input.submissionTypes : ['text'],
      maxAttempts: input.maxAttempts ?? 1,
      isRequired: input.isRequired ?? true,
      status: 'draft',
    })
    .returning()

  await recordAudit(ctx, {
    action: 'assignment.created',
    resourceType: 'assignment',
    resourceId: assignment.id,
    metadata: { courseId },
  })

  return assignment
}

export async function updateAssignment(
  ctx: AuthContext,
  assignmentId: string,
  input: Partial<AssignmentInput>
) {
  const assignment = await assertAssignmentManage(ctx, assignmentId)
  if (input.lessonId !== undefined) {
    await validateLesson(assignment.courseId, input.lessonId)
  }

  const [updated] = await db
    .update(assignments)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.instructions !== undefined ? { instructions: input.instructions } : {}),
      ...(input.dueAt !== undefined
        ? { dueAt: input.dueAt ? new Date(input.dueAt) : null }
        : {}),
      ...(input.submissionTypes !== undefined
        ? { submissionTypes: input.submissionTypes }
        : {}),
      ...(input.maxAttempts !== undefined ? { maxAttempts: input.maxAttempts } : {}),
      ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
      ...(input.lessonId !== undefined ? { lessonId: input.lessonId } : {}),
      updatedAt: new Date(),
    })
    .where(eq(assignments.id, assignmentId))
    .returning()

  return updated
}

export async function publishAssignment(ctx: AuthContext, assignmentId: string) {
  const assignment = await assertAssignmentManage(ctx, assignmentId)
  const rubric = await getRubricWithCriteria(assignmentId)
  if (!rubric || rubric.criteria.length === 0) {
    throw conflict('RUBRIC_REQUIRED', 'Add at least one rubric criterion before publishing')
  }

  const [updated] = await db
    .update(assignments)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(assignments.id, assignmentId))
    .returning()

  await recordAudit(ctx, {
    action: 'assignment.published',
    resourceType: 'assignment',
    resourceId: assignmentId,
    metadata: { courseId: assignment.courseId },
  })

  return updated
}

export async function deleteAssignment(ctx: AuthContext, assignmentId: string) {
  const assignment = await assertAssignmentManage(ctx, assignmentId)
  await db.delete(assignments).where(eq(assignments.id, assignmentId))
  await recordAudit(ctx, {
    action: 'assignment.deleted',
    resourceType: 'assignment',
    resourceId: assignmentId,
    metadata: { courseId: assignment.courseId },
  })
}

export async function getAssignmentForManagement(
  ctx: AuthContext,
  assignmentId: string
) {
  const assignment = await assertAssignmentManage(ctx, assignmentId)
  const [rubric, submissions] = await Promise.all([
    getRubricWithCriteria(assignmentId),
    db
      .select({
        id: assignmentSubmissions.id,
        studentId: assignmentSubmissions.studentId,
        studentName: profiles.name,
        studentEmail: profiles.email,
        attempt: assignmentSubmissions.attempt,
        status: assignmentSubmissions.status,
        content: assignmentSubmissions.content,
        repoUrl: assignmentSubmissions.repoUrl,
        linkUrl: assignmentSubmissions.linkUrl,
        submittedAt: assignmentSubmissions.submittedAt,
        reviewedAt: assignmentSubmissions.reviewedAt,
      })
      .from(assignmentSubmissions)
      .innerJoin(profiles, eq(profiles.id, assignmentSubmissions.studentId))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.submittedAt)),
  ])

  const submissionIds = submissions.map((submission) => submission.id)
  const [files, reviews] = await Promise.all([
    submissionIds.length
      ? db
          .select()
          .from(submissionFiles)
          .where(inArray(submissionFiles.submissionId, submissionIds))
      : Promise.resolve([]),
    submissionIds.length
      ? db
          .select()
          .from(assignmentReviews)
          .where(inArray(assignmentReviews.submissionId, submissionIds))
          .orderBy(desc(assignmentReviews.createdAt))
      : Promise.resolve([]),
  ])

  const reviewIds = reviews.map((review) => review.id)
  const scores = reviewIds.length
    ? await db
        .select()
        .from(reviewScores)
        .where(inArray(reviewScores.reviewId, reviewIds))
    : []

  return {
    assignment,
    rubric,
    submissions: submissions.map((submission) => {
      const latestReview = reviews.find(
        (review) => review.submissionId === submission.id
      )
      return {
        ...submission,
        files: files.filter((file) => file.submissionId === submission.id),
        review: latestReview
          ? {
              ...latestReview,
              scores: scores.filter((score) => score.reviewId === latestReview.id),
            }
          : null,
      }
    }),
  }
}

export async function upsertRubric(
  ctx: AuthContext,
  assignmentId: string,
  input: { title?: string; criteria: RubricCriterionInput[] }
) {
  const assignment = await assertAssignmentManage(ctx, assignmentId)
  if (input.criteria.length === 0) {
    throw badRequest('A rubric needs at least one criterion')
  }

  const existingSubmissionIds = await db
    .select({ id: assignmentSubmissions.id })
    .from(assignmentSubmissions)
    .where(eq(assignmentSubmissions.assignmentId, assignmentId))

  if (existingSubmissionIds.length > 0) {
    const existingReviews = await db
      .select({ id: assignmentReviews.id })
      .from(assignmentReviews)
      .where(
        inArray(
          assignmentReviews.submissionId,
          existingSubmissionIds.map((row) => row.id)
        )
      )
      .limit(1)
    if (existingReviews.length > 0) {
      throw conflict(
        'RUBRIC_LOCKED',
        'Rubric cannot change after a submission has been reviewed'
      )
    }
  }

  await db.transaction(async (tx) => {
    let [rubric] = await tx
      .select()
      .from(rubrics)
      .where(eq(rubrics.assignmentId, assignmentId))
      .limit(1)

    if (!rubric) {
      ;[rubric] = await tx
        .insert(rubrics)
        .values({
          assignmentId,
          title: input.title ?? 'Evaluation rubric',
        })
        .returning()
    } else {
      ;[rubric] = await tx
        .update(rubrics)
        .set({ title: input.title ?? rubric.title, updatedAt: new Date() })
        .where(eq(rubrics.id, rubric.id))
        .returning()
    }

    await tx.delete(rubricCriteria).where(eq(rubricCriteria.rubricId, rubric.id))

    for (const [index, criterion] of input.criteria.entries()) {
      await tx.insert(rubricCriteria).values({
        rubricId: rubric.id,
        title: criterion.title,
        description: criterion.description ?? null,
        maxPoints: criterion.maxPoints,
        position: index,
      })
    }
  })

  await recordAudit(ctx, {
    action: 'assignment.rubric.updated',
    resourceType: 'assignment',
    resourceId: assignmentId,
    metadata: { courseId: assignment.courseId, criteria: input.criteria.length },
  })

  return getRubricWithCriteria(assignmentId)
}

export async function listStudentAssignments(ctx: AuthContext) {
  const enrolled = await db
    .select({ courseId: courseEnrollments.courseId })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.studentId, ctx.profile.id))

  const courseIds = enrolled.map((row) => row.courseId)
  if (courseIds.length === 0) return []

  const rows = await db
    .select({
      id: assignments.id,
      courseId: assignments.courseId,
      courseTitle: courses.title,
      title: assignments.title,
      dueAt: assignments.dueAt,
      isRequired: assignments.isRequired,
      maxAttempts: assignments.maxAttempts,
      submissionTypes: assignments.submissionTypes,
      status: assignments.status,
    })
    .from(assignments)
    .innerJoin(courses, eq(courses.id, assignments.courseId))
    .where(
      and(eq(assignments.status, 'published'), inArray(assignments.courseId, courseIds))
    )
    .orderBy(asc(assignments.dueAt), desc(assignments.createdAt))

  const assignmentIds = rows.map((row) => row.id)
  const submissions = assignmentIds.length
    ? await db
        .select()
        .from(assignmentSubmissions)
        .where(
          and(
            eq(assignmentSubmissions.studentId, ctx.profile.id),
            inArray(assignmentSubmissions.assignmentId, assignmentIds)
          )
        )
        .orderBy(desc(assignmentSubmissions.attempt))
    : []

  return rows.map((assignment) => {
    const latest = submissions.find(
      (submission) => submission.assignmentId === assignment.id
    )
    return {
      ...assignment,
      latestSubmission: latest ?? null,
      canSubmit:
        !latest ||
        (latest.status !== 'approved' && latest.status !== 'graded')
          ? latest
            ? latest.attempt < assignment.maxAttempts
            : true
          : false,
      isOverdue:
        Boolean(assignment.dueAt) &&
        new Date(assignment.dueAt as Date).getTime() < Date.now() &&
        !latest,
    }
  })
}

export async function assertStudentAssignmentAccess(ctx: AuthContext, assignmentId: string) {
  const assignment = await getAssignment(assignmentId)
  if (!assignment || assignment.status !== 'published') {
    throw notFound('Assignment not found')
  }
  const course = await getCourseById(assignment.courseId)
  if (!course || !(await hasCourseEntitlement(ctx.profile.id, course))) {
    throw forbidden('You do not have access to this assignment')
  }
  return assignment
}

export async function getStudentAssignment(ctx: AuthContext, assignmentId: string) {
  const assignment = await assertStudentAssignmentAccess(ctx, assignmentId)
  const [course, rubric, submissions] = await Promise.all([
    getCourseById(assignment.courseId),
    getRubricWithCriteria(assignmentId),
    db
      .select()
      .from(assignmentSubmissions)
      .where(
        and(
          eq(assignmentSubmissions.assignmentId, assignmentId),
          eq(assignmentSubmissions.studentId, ctx.profile.id)
        )
      )
      .orderBy(desc(assignmentSubmissions.attempt)),
  ])

  const submissionIds = submissions.map((submission) => submission.id)
  const [files, reviews] = await Promise.all([
    submissionIds.length
      ? db
          .select()
          .from(submissionFiles)
          .where(inArray(submissionFiles.submissionId, submissionIds))
      : Promise.resolve([]),
    submissionIds.length
      ? db
          .select()
          .from(assignmentReviews)
          .where(inArray(assignmentReviews.submissionId, submissionIds))
          .orderBy(desc(assignmentReviews.createdAt))
      : Promise.resolve([]),
  ])

  const reviewIds = reviews.map((review) => review.id)
  const scores = reviewIds.length
    ? await db
        .select()
        .from(reviewScores)
        .where(inArray(reviewScores.reviewId, reviewIds))
    : []

  const latest = submissions[0] ?? null
  const canSubmit = !latest
    ? true
    : latest.status !== 'approved' &&
      latest.status !== 'graded' &&
      latest.attempt < assignment.maxAttempts

  return {
    assignment,
    course: course ? { id: course.id, title: course.title } : null,
    rubric,
    submissions: submissions.map((submission) => {
      const review = reviews.find((row) => row.submissionId === submission.id)
      return {
        ...submission,
        files: files.filter((file) => file.submissionId === submission.id),
        review: review
          ? {
              ...review,
              scores: scores.filter((score) => score.reviewId === review.id),
            }
          : null,
      }
    }),
    canSubmit,
  }
}

export async function submitAssignment(
  ctx: AuthContext,
  assignmentId: string,
  input: {
    content?: string | null
    repoUrl?: string | null
    linkUrl?: string | null
    files?: { storagePath: string; fileName: string; mimeType?: string; sizeBytes?: number }[]
  }
) {
  const assignment = await assertStudentAssignmentAccess(ctx, assignmentId)
  const [latest] = await db
    .select()
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, ctx.profile.id)
      )
    )
    .orderBy(desc(assignmentSubmissions.attempt))
    .limit(1)

  if (latest && (latest.status === 'approved' || latest.status === 'graded')) {
    throw conflict('ASSIGNMENT_ALREADY_ACCEPTED', 'This assignment has already been accepted')
  }
  if (latest && latest.attempt >= assignment.maxAttempts) {
    throw conflict('MAX_ATTEMPTS_REACHED', 'No submission attempts remain')
  }

  const hasContent =
    Boolean(input.content?.trim()) ||
    Boolean(input.repoUrl?.trim()) ||
    Boolean(input.linkUrl?.trim()) ||
    (input.files?.length ?? 0) > 0
  if (!hasContent) {
    throw badRequest('Add text, a link, a repository, or at least one file')
  }

  const attempt = (latest?.attempt ?? 0) + 1

  const submission = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(assignmentSubmissions)
      .values({
        assignmentId,
        studentId: ctx.profile.id,
        attempt,
        status: 'submitted',
        content: input.content?.trim() || null,
        repoUrl: input.repoUrl?.trim() || null,
        linkUrl: input.linkUrl?.trim() || null,
      })
      .returning()

    for (const file of input.files ?? []) {
      await tx.insert(submissionFiles).values({
        submissionId: created.id,
        storagePath: file.storagePath,
        fileName: file.fileName,
        mimeType: file.mimeType ?? null,
        sizeBytes: file.sizeBytes ?? null,
      })
    }

    return created
  })

  await recordAudit(ctx, {
    action: 'assignment.submitted',
    resourceType: 'assignment',
    resourceId: assignmentId,
    metadata: { courseId: assignment.courseId, attempt },
  })

  return submission
}

export async function listReviewQueue(ctx: AuthContext, courseId?: string) {
  const managedCourses = await db
    .select({ id: courses.id, title: courses.title })
    .from(courses)
    .where(
      ctx.role === 'super_admin'
        ? eq(courses.isCapstone, false)
        : eq(courses.teacherId, ctx.profile.id)
    )

  const courseIds = managedCourses
    .filter((course) => !courseId || course.id === courseId)
    .map((course) => course.id)
  if (courseIds.length === 0) return []

  return db
    .select({
      submissionId: assignmentSubmissions.id,
      assignmentId: assignments.id,
      assignmentTitle: assignments.title,
      courseId: assignments.courseId,
      courseTitle: courses.title,
      studentId: assignmentSubmissions.studentId,
      studentName: profiles.name,
      studentEmail: profiles.email,
      attempt: assignmentSubmissions.attempt,
      status: assignmentSubmissions.status,
      submittedAt: assignmentSubmissions.submittedAt,
      content: assignmentSubmissions.content,
      repoUrl: assignmentSubmissions.repoUrl,
      linkUrl: assignmentSubmissions.linkUrl,
    })
    .from(assignmentSubmissions)
    .innerJoin(assignments, eq(assignments.id, assignmentSubmissions.assignmentId))
    .innerJoin(courses, eq(courses.id, assignments.courseId))
    .innerJoin(profiles, eq(profiles.id, assignmentSubmissions.studentId))
    .where(
      and(
        inArray(assignments.courseId, courseIds),
        inArray(assignmentSubmissions.status, ['submitted', 'under_review'])
      )
    )
    .orderBy(asc(assignmentSubmissions.submittedAt))
}

export async function reviewSubmission(
  ctx: AuthContext,
  submissionId: string,
  input: {
    decision: 'approved' | 'changes_requested' | 'graded'
    overallFeedback?: string | null
    scores: { criterionId: string; points: number; comment?: string | null }[]
  }
) {
  const [submission] = await db
    .select()
    .from(assignmentSubmissions)
    .where(eq(assignmentSubmissions.id, submissionId))
    .limit(1)
  if (!submission) throw notFound('Submission not found')

  const assignment = await assertAssignmentManage(ctx, submission.assignmentId)
  const rubric = await getRubricWithCriteria(assignment.id)
  if (!rubric) throw conflict('RUBRIC_REQUIRED', 'This assignment has no rubric')

  const criterionMap = new Map(
    rubric.criteria.map((criterion) => [criterion.id, criterion])
  )
  if (input.scores.length !== rubric.criteria.length) {
    throw badRequest('Every rubric criterion must be scored')
  }

  let totalScore = 0
  for (const score of input.scores) {
    const criterion = criterionMap.get(score.criterionId)
    if (!criterion) throw badRequest('Score includes an invalid criterion')
    if (score.points < 0 || score.points > criterion.maxPoints) {
      throw badRequest(`Score for "${criterion.title}" must be between 0 and ${criterion.maxPoints}`)
    }
    totalScore += score.points
  }

  const status =
    input.decision === 'changes_requested'
      ? 'changes_requested'
      : input.decision === 'graded'
      ? 'graded'
      : 'approved'

  const review = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(assignmentReviews)
      .values({
        submissionId,
        reviewerId: ctx.profile.id,
        decision: input.decision,
        overallFeedback: input.overallFeedback?.trim() || null,
        totalScore,
      })
      .returning()

    for (const score of input.scores) {
      await tx.insert(reviewScores).values({
        reviewId: created.id,
        criterionId: score.criterionId,
        points: score.points,
        comment: score.comment?.trim() || null,
      })
    }

    await tx
      .update(assignmentSubmissions)
      .set({ status, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(assignmentSubmissions.id, submissionId))

    return created
  })

  await recordAudit(ctx, {
    action: 'assignment.reviewed',
    resourceType: 'assignment',
    resourceId: assignment.id,
    metadata: {
      submissionId,
      decision: input.decision,
      totalScore,
      courseId: assignment.courseId,
    },
  })

  const accepted = status === 'approved' || status === 'graded'
  await createNotification({
    profileId: submission.studentId,
    type: 'assignment_reviewed',
    title: accepted ? 'Assignment accepted' : 'Assignment needs changes',
    body: `${assignment.title} was ${
      accepted ? 'accepted' : 'returned with change requests'
    }.`,
    linkUrl: `/student/assignments/${assignment.id}`,
    dedupeKey: `assignment-review:${submissionId}`,
    metadata: {
      assignmentId: assignment.id,
      submissionId,
      decision: input.decision,
    },
  })

  return { review, totalScore, status }
}
