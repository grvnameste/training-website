import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  courseEnrollments,
  courses,
  profiles,
  projectInstanceMilestones,
  projectInstances,
  projectMilestoneFiles,
  projectMilestones,
  projectMilestoneSubmissions,
  projectPhases,
  projectTemplates,
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
import { recordAudit } from './audit-service'
import { createNotification } from './notification-service'

async function getTemplate(templateId: string) {
  const [template] = await db
    .select()
    .from(projectTemplates)
    .where(eq(projectTemplates.id, templateId))
    .limit(1)
  return template ?? null
}

export async function assertTemplateManage(ctx: AuthContext, templateId: string) {
  const template = await getTemplate(templateId)
  if (!template) throw notFound('Project template not found')
  await assertCourseManage(ctx, template.courseId)
  return template
}

export async function getTemplateTree(templateId: string) {
  const phases = await db
    .select()
    .from(projectPhases)
    .where(eq(projectPhases.templateId, templateId))
    .orderBy(asc(projectPhases.position))

  const phaseIds = phases.map((phase) => phase.id)
  const milestones = phaseIds.length
    ? await db
        .select()
        .from(projectMilestones)
        .where(inArray(projectMilestones.phaseId, phaseIds))
        .orderBy(asc(projectMilestones.position))
    : []

  return phases.map((phase) => ({
    ...phase,
    milestones: milestones.filter((milestone) => milestone.phaseId === phase.id),
  }))
}

export async function listInstructorTemplates(ctx: AuthContext, courseId: string) {
  await assertCourseManage(ctx, courseId)
  return db
    .select({
      id: projectTemplates.id,
      courseId: projectTemplates.courseId,
      title: projectTemplates.title,
      description: projectTemplates.description,
      status: projectTemplates.status,
      createdAt: projectTemplates.createdAt,
      instanceCount: sql<number>`(
        select count(*)::int from ${projectInstances}
        where ${projectInstances.templateId} = ${projectTemplates.id}
      )`,
      milestoneCount: sql<number>`(
        select count(*)::int from ${projectMilestones}
        inner join ${projectPhases} on ${projectPhases.id} = ${projectMilestones.phaseId}
        where ${projectPhases.templateId} = ${projectTemplates.id}
      )`,
    })
    .from(projectTemplates)
    .where(eq(projectTemplates.courseId, courseId))
    .orderBy(desc(projectTemplates.createdAt))
}

export async function createTemplate(
  ctx: AuthContext,
  courseId: string,
  input: { title: string; description?: string | null }
) {
  await assertCourseManage(ctx, courseId)
  const [template] = await db
    .insert(projectTemplates)
    .values({
      courseId,
      createdBy: ctx.profile.id,
      title: input.title,
      description: input.description ?? null,
      status: 'draft',
    })
    .returning()

  await recordAudit(ctx, {
    action: 'project.template.created',
    resourceType: 'project_template',
    resourceId: template.id,
    metadata: { courseId },
  })
  return template
}

export async function updateTemplate(
  ctx: AuthContext,
  templateId: string,
  input: { title?: string; description?: string | null }
) {
  const template = await assertTemplateManage(ctx, templateId)
  const [updated] = await db
    .update(projectTemplates)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedAt: new Date(),
    })
    .where(eq(projectTemplates.id, templateId))
    .returning()
  return updated
}

export async function publishTemplate(ctx: AuthContext, templateId: string) {
  const template = await assertTemplateManage(ctx, templateId)
  const phases = await getTemplateTree(templateId)
  const milestoneCount = phases.reduce(
    (sum, phase) => sum + phase.milestones.length,
    0
  )
  if (milestoneCount === 0) {
    throw conflict('MILESTONES_REQUIRED', 'Add at least one milestone before publishing')
  }

  const [updated] = await db
    .update(projectTemplates)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(projectTemplates.id, templateId))
    .returning()

  await recordAudit(ctx, {
    action: 'project.template.published',
    resourceType: 'project_template',
    resourceId: templateId,
    metadata: { courseId: template.courseId, milestones: milestoneCount },
  })
  return updated
}

export async function deleteTemplate(ctx: AuthContext, templateId: string) {
  const template = await assertTemplateManage(ctx, templateId)
  await db.delete(projectTemplates).where(eq(projectTemplates.id, templateId))
  await recordAudit(ctx, {
    action: 'project.template.deleted',
    resourceType: 'project_template',
    resourceId: templateId,
    metadata: { courseId: template.courseId },
  })
}

export async function addPhase(
  ctx: AuthContext,
  templateId: string,
  input: { title: string; description?: string | null }
) {
  await assertTemplateManage(ctx, templateId)
  const existing = await db
    .select({ position: projectPhases.position })
    .from(projectPhases)
    .where(eq(projectPhases.templateId, templateId))
  const nextPosition = existing.length
    ? Math.max(...existing.map((phase) => phase.position)) + 1
    : 0

  const [phase] = await db
    .insert(projectPhases)
    .values({
      templateId,
      title: input.title,
      description: input.description ?? null,
      position: nextPosition,
    })
    .returning()
  return phase
}

export async function deletePhase(ctx: AuthContext, phaseId: string) {
  const [phase] = await db
    .select({ templateId: projectPhases.templateId })
    .from(projectPhases)
    .where(eq(projectPhases.id, phaseId))
    .limit(1)
  if (!phase) throw notFound('Project phase not found')
  await assertTemplateManage(ctx, phase.templateId)
  await db.delete(projectPhases).where(eq(projectPhases.id, phaseId))
}

export async function addMilestone(
  ctx: AuthContext,
  phaseId: string,
  input: {
    title: string
    description?: string | null
    acceptanceCriteria?: string | null
    estimatedHours?: number | null
    dueOffsetDays?: number | null
    isRequired?: boolean
  }
) {
  const [phase] = await db
    .select({ templateId: projectPhases.templateId })
    .from(projectPhases)
    .where(eq(projectPhases.id, phaseId))
    .limit(1)
  if (!phase) throw notFound('Project phase not found')
  await assertTemplateManage(ctx, phase.templateId)

  const existing = await db
    .select({ position: projectMilestones.position })
    .from(projectMilestones)
    .where(eq(projectMilestones.phaseId, phaseId))
  const nextPosition = existing.length
    ? Math.max(...existing.map((milestone) => milestone.position)) + 1
    : 0

  const [milestone] = await db
    .insert(projectMilestones)
    .values({
      phaseId,
      title: input.title,
      description: input.description ?? null,
      acceptanceCriteria: input.acceptanceCriteria ?? null,
      estimatedHours: input.estimatedHours ?? null,
      dueOffsetDays: input.dueOffsetDays ?? null,
      isRequired: input.isRequired ?? true,
      position: nextPosition,
    })
    .returning()
  return milestone
}

export async function updateMilestone(
  ctx: AuthContext,
  milestoneId: string,
  input: {
    title?: string
    description?: string | null
    acceptanceCriteria?: string | null
    estimatedHours?: number | null
    dueOffsetDays?: number | null
    isRequired?: boolean
  }
) {
  const [milestone] = await db
    .select({ phaseId: projectMilestones.phaseId })
    .from(projectMilestones)
    .where(eq(projectMilestones.id, milestoneId))
    .limit(1)
  if (!milestone) throw notFound('Milestone not found')
  const [phase] = await db
    .select({ templateId: projectPhases.templateId })
    .from(projectPhases)
    .where(eq(projectPhases.id, milestone.phaseId))
    .limit(1)
  if (!phase) throw notFound('Milestone not found')
  await assertTemplateManage(ctx, phase.templateId)

  const [updated] = await db
    .update(projectMilestones)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.acceptanceCriteria !== undefined
        ? { acceptanceCriteria: input.acceptanceCriteria }
        : {}),
      ...(input.estimatedHours !== undefined
        ? { estimatedHours: input.estimatedHours }
        : {}),
      ...(input.dueOffsetDays !== undefined
        ? { dueOffsetDays: input.dueOffsetDays }
        : {}),
      ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
    })
    .where(eq(projectMilestones.id, milestoneId))
    .returning()
  return updated
}

export async function deleteMilestone(ctx: AuthContext, milestoneId: string) {
  const [milestone] = await db
    .select({ phaseId: projectMilestones.phaseId })
    .from(projectMilestones)
    .where(eq(projectMilestones.id, milestoneId))
    .limit(1)
  if (!milestone) throw notFound('Milestone not found')
  const [phase] = await db
    .select({ templateId: projectPhases.templateId })
    .from(projectPhases)
    .where(eq(projectPhases.id, milestone.phaseId))
    .limit(1)
  if (!phase) throw notFound('Milestone not found')
  await assertTemplateManage(ctx, phase.templateId)
  await db.delete(projectMilestones).where(eq(projectMilestones.id, milestoneId))
}

export async function listStudentProjects(ctx: AuthContext) {
  const enrolled = await db
    .select({ courseId: courseEnrollments.courseId })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.studentId, ctx.profile.id))
  const courseIds = enrolled.map((row) => row.courseId)
  if (courseIds.length === 0) return { projects: [], available: [] }

  const instances = await db
    .select({
      id: projectInstances.id,
      templateId: projectInstances.templateId,
      courseId: projectInstances.courseId,
      status: projectInstances.status,
      startedAt: projectInstances.startedAt,
      completedAt: projectInstances.completedAt,
      templateTitle: projectTemplates.title,
      courseTitle: courses.title,
    })
    .from(projectInstances)
    .innerJoin(projectTemplates, eq(projectTemplates.id, projectInstances.templateId))
    .innerJoin(courses, eq(courses.id, projectInstances.courseId))
    .where(eq(projectInstances.studentId, ctx.profile.id))
    .orderBy(desc(projectInstances.startedAt))

  const instanceIds = instances.map((instance) => instance.id)
  const milestoneStatuses = instanceIds.length
    ? await db
        .select({
          id: projectInstanceMilestones.id,
          instanceId: projectInstanceMilestones.instanceId,
          status: projectInstanceMilestones.status,
          dueAt: projectInstanceMilestones.dueAt,
          title: projectMilestones.title,
          isRequired: projectMilestones.isRequired,
        })
        .from(projectInstanceMilestones)
        .innerJoin(
          projectMilestones,
          eq(projectMilestones.id, projectInstanceMilestones.milestoneId)
        )
        .where(inArray(projectInstanceMilestones.instanceId, instanceIds))
    : []

  const startedTemplateIds = new Set(instances.map((instance) => instance.templateId))
  const publishedTemplates = await db
    .select({
      id: projectTemplates.id,
      courseId: projectTemplates.courseId,
      title: projectTemplates.title,
      description: projectTemplates.description,
      courseTitle: courses.title,
    })
    .from(projectTemplates)
    .innerJoin(courses, eq(courses.id, projectTemplates.courseId))
    .where(
      and(
        eq(projectTemplates.status, 'published'),
        inArray(projectTemplates.courseId, courseIds)
      )
    )

  const projects = instances.map((instance) => {
    const milestones = milestoneStatuses.filter(
      (milestone) => milestone.instanceId === instance.id
    )
    const approved = milestones.filter(
      (milestone) => milestone.status === 'approved'
    ).length
    const current = milestones.find((milestone) =>
      ['available', 'changes_requested', 'submitted'].includes(milestone.status)
    )
    const now = Date.now()
    const soon = now + 3 * 86400000
    const openMilestones = milestones.filter((milestone) =>
      ['available', 'changes_requested'].includes(milestone.status)
    )
    const dueSoon = openMilestones.filter((milestone) => {
      if (!milestone.dueAt) return false
      const due = new Date(milestone.dueAt).getTime()
      return due >= now && due <= soon
    }).length
    const overdue = openMilestones.filter((milestone) => {
      if (!milestone.dueAt) return false
      return new Date(milestone.dueAt).getTime() < now
    }).length

    return {
      ...instance,
      totalMilestones: milestones.length,
      approvedMilestones: approved,
      progress:
        milestones.length > 0 ? Math.round((approved / milestones.length) * 100) : 0,
      currentMilestoneId: current?.id ?? null,
      currentMilestoneStatus: current?.status ?? null,
      currentMilestoneTitle: current?.title ?? null,
      currentMilestoneDueAt: current?.dueAt ?? null,
      dueSoonMilestones: dueSoon,
      overdueMilestones: overdue,
    }
  })

  return {
    projects,
    available: publishedTemplates.filter(
      (template) => !startedTemplateIds.has(template.id)
    ),
  }
}

export async function startProject(ctx: AuthContext, templateId: string) {
  const template = await getTemplate(templateId)
  if (!template || template.status !== 'published') {
    throw notFound('Project template not found')
  }
  const course = await getCourseById(template.courseId)
  if (!course || !(await hasCourseEntitlement(ctx.profile.id, course))) {
    throw forbidden('You do not have access to this project')
  }

  const [existing] = await db
    .select()
    .from(projectInstances)
    .where(
      and(
        eq(projectInstances.templateId, templateId),
        eq(projectInstances.studentId, ctx.profile.id)
      )
    )
    .limit(1)
  if (existing) return existing

  const phases = await getTemplateTree(templateId)
  const orderedMilestones = phases.flatMap((phase) => phase.milestones)

  return db.transaction(async (tx) => {
    const [instance] = await tx
      .insert(projectInstances)
      .values({
        templateId,
        courseId: template.courseId,
        studentId: ctx.profile.id,
        status: 'active',
      })
      .returning()

    for (const [index, milestone] of orderedMilestones.entries()) {
      await tx.insert(projectInstanceMilestones).values({
        instanceId: instance.id,
        milestoneId: milestone.id,
        status: index === 0 ? 'available' : 'locked',
        dueAt: milestone.dueOffsetDays
          ? new Date(Date.now() + milestone.dueOffsetDays * 86400000)
          : null,
      })
    }

    await recordAudit(ctx, {
      action: 'project.started',
      resourceType: 'project_instance',
      resourceId: instance.id,
      metadata: { templateId, courseId: template.courseId },
    })
    return instance
  })
}

async function assertStudentInstance(ctx: AuthContext, instanceId: string) {
  const [instance] = await db
    .select()
    .from(projectInstances)
    .where(eq(projectInstances.id, instanceId))
    .limit(1)
  if (!instance || instance.studentId !== ctx.profile.id) {
    throw notFound('Project not found')
  }
  const course = await getCourseById(instance.courseId)
  if (!course || !(await hasCourseEntitlement(ctx.profile.id, course))) {
    throw forbidden('You do not have access to this project')
  }
  return instance
}

export async function getStudentProject(ctx: AuthContext, instanceId: string) {
  const instance = await assertStudentInstance(ctx, instanceId)
  const template = await getTemplate(instance.templateId)
  if (!template) throw notFound('Project not found')

  const phases = await getTemplateTree(instance.templateId)
  const milestones = await db
    .select()
    .from(projectInstanceMilestones)
    .where(eq(projectInstanceMilestones.instanceId, instanceId))

  const milestoneIds = milestones.map((milestone) => milestone.id)
  const submissions = milestoneIds.length
    ? await db
        .select()
        .from(projectMilestoneSubmissions)
        .where(inArray(projectMilestoneSubmissions.instanceMilestoneId, milestoneIds))
        .orderBy(desc(projectMilestoneSubmissions.submittedAt))
    : []

  const submissionIds = submissions.map((submission) => submission.id)
  const files = submissionIds.length
    ? await db
        .select()
        .from(projectMilestoneFiles)
        .where(inArray(projectMilestoneFiles.submissionId, submissionIds))
    : []

  return {
    instance,
    template,
    phases: phases.map((phase) => ({
      ...phase,
      milestones: phase.milestones.map((milestone) => {
        const instanceMilestone = milestones.find(
          (row) => row.milestoneId === milestone.id
        )
        const history = submissions.filter(
          (submission) => submission.instanceMilestoneId === instanceMilestone?.id
        )
        return {
          ...milestone,
          instanceMilestone: instanceMilestone ?? null,
          submissions: history.map((submission) => ({
            ...submission,
            files: files.filter((file) => file.submissionId === submission.id),
          })),
        }
      }),
    })),
  }
}

export async function assertMilestoneUploadAccess(
  ctx: AuthContext,
  instanceMilestoneId: string
) {
  const [instanceMilestone] = await db
    .select()
    .from(projectInstanceMilestones)
    .where(eq(projectInstanceMilestones.id, instanceMilestoneId))
    .limit(1)
  if (!instanceMilestone) throw notFound('Milestone not found')
  const instance = await assertStudentInstance(ctx, instanceMilestone.instanceId)
  if (!['available', 'changes_requested'].includes(instanceMilestone.status)) {
    throw conflict('MILESTONE_NOT_OPEN', 'This milestone is not open for submission')
  }
  return { instance, instanceMilestone }
}

export async function submitMilestone(
  ctx: AuthContext,
  instanceMilestoneId: string,
  input: {
    content?: string | null
    repoUrl?: string | null
    linkUrl?: string | null
    files?: { storagePath: string; fileName: string; mimeType?: string; sizeBytes?: number }[]
  }
) {
  const [instanceMilestone] = await db
    .select()
    .from(projectInstanceMilestones)
    .where(eq(projectInstanceMilestones.id, instanceMilestoneId))
    .limit(1)
  if (!instanceMilestone) throw notFound('Milestone not found')

  const instance = await assertStudentInstance(ctx, instanceMilestone.instanceId)
  if (!['available', 'changes_requested'].includes(instanceMilestone.status)) {
    throw conflict('MILESTONE_NOT_OPEN', 'This milestone is not open for submission')
  }

  const [latest] = await db
    .select()
    .from(projectMilestoneSubmissions)
    .where(
      eq(projectMilestoneSubmissions.instanceMilestoneId, instanceMilestoneId)
    )
    .orderBy(desc(projectMilestoneSubmissions.attempt))
    .limit(1)

  const hasContent =
    Boolean(input.content?.trim()) ||
    Boolean(input.repoUrl?.trim()) ||
    Boolean(input.linkUrl?.trim()) ||
    (input.files?.length ?? 0) > 0
  if (!hasContent) throw badRequest('Add text, links, or files before submitting')

  const attempt = (latest?.attempt ?? 0) + 1

  const submission = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(projectMilestoneSubmissions)
      .values({
        instanceMilestoneId,
        studentId: ctx.profile.id,
        attempt,
        content: input.content?.trim() || null,
        repoUrl: input.repoUrl?.trim() || null,
        linkUrl: input.linkUrl?.trim() || null,
      })
      .returning()

    for (const file of input.files ?? []) {
      await tx.insert(projectMilestoneFiles).values({
        submissionId: created.id,
        storagePath: file.storagePath,
        fileName: file.fileName,
        mimeType: file.mimeType ?? null,
        sizeBytes: file.sizeBytes ?? null,
      })
    }

    await tx
      .update(projectInstanceMilestones)
      .set({ status: 'submitted', submittedAt: new Date() })
      .where(eq(projectInstanceMilestones.id, instanceMilestoneId))

    return created
  })

  await recordAudit(ctx, {
    action: 'project.milestone.submitted',
    resourceType: 'project_instance',
    resourceId: instance.id,
    metadata: { instanceMilestoneId, attempt },
  })

  const course = await getCourseById(instance.courseId)
  if (course?.teacherId) {
    const [templateMilestone] = await db
      .select({ title: projectMilestones.title })
      .from(projectMilestones)
      .where(eq(projectMilestones.id, instanceMilestone.milestoneId))
      .limit(1)
    await createNotification({
      profileId: course.teacherId,
      type: 'project_milestone_submitted',
      title: 'New project milestone submission',
      body: `${ctx.profile.name} submitted "${
        templateMilestone?.title ?? 'a milestone'
      }" for review.`,
      linkUrl: '/teacher/project-reviews',
      dedupeKey: `project-milestone-submission:${submission.id}`,
      metadata: {
        instanceId: instance.id,
        instanceMilestoneId,
        submissionId: submission.id,
        studentId: ctx.profile.id,
      },
    })
  }

  return submission
}

export async function listProjectReviewQueue(ctx: AuthContext) {
  const coursesManaged = await db
    .select({ id: courses.id })
    .from(courses)
    .where(
      ctx.role === 'super_admin' ? sql`true` : eq(courses.teacherId, ctx.profile.id)
    )
  const courseIds = coursesManaged.map((course) => course.id)
  if (courseIds.length === 0) return []

  const rows = await db
    .select({
      submissionId: projectMilestoneSubmissions.id,
      instanceId: projectInstances.id,
      instanceMilestoneId: projectInstanceMilestones.id,
      templateTitle: projectTemplates.title,
      courseId: projectInstances.courseId,
      courseTitle: courses.title,
      milestoneTitle: projectMilestones.title,
      studentId: projectInstances.studentId,
      studentName: profiles.name,
      studentEmail: profiles.email,
      attempt: projectMilestoneSubmissions.attempt,
      submittedAt: projectMilestoneSubmissions.submittedAt,
      content: projectMilestoneSubmissions.content,
      repoUrl: projectMilestoneSubmissions.repoUrl,
      linkUrl: projectMilestoneSubmissions.linkUrl,
    })
    .from(projectMilestoneSubmissions)
    .innerJoin(
      projectInstanceMilestones,
      eq(projectInstanceMilestones.id, projectMilestoneSubmissions.instanceMilestoneId)
    )
    .innerJoin(projectInstances, eq(projectInstances.id, projectInstanceMilestones.instanceId))
    .innerJoin(projectTemplates, eq(projectTemplates.id, projectInstances.templateId))
    .innerJoin(projectMilestones, eq(projectMilestones.id, projectInstanceMilestones.milestoneId))
    .innerJoin(courses, eq(courses.id, projectInstances.courseId))
    .innerJoin(profiles, eq(profiles.id, projectInstances.studentId))
    .where(
      and(
        inArray(projectInstances.courseId, courseIds),
        eq(projectInstanceMilestones.status, 'submitted')
      )
    )
    .orderBy(asc(projectMilestoneSubmissions.submittedAt))

  const latestByMilestone = new Map<string, (typeof rows)[number]>()
  for (const row of rows) {
    const existing = latestByMilestone.get(row.instanceMilestoneId)
    if (!existing || row.attempt > existing.attempt) {
      latestByMilestone.set(row.instanceMilestoneId, row)
    }
  }
  return [...latestByMilestone.values()]
}

export async function reviewMilestone(
  ctx: AuthContext,
  submissionId: string,
  input: { decision: 'approved' | 'changes_requested'; feedback?: string | null }
) {
  const [submission] = await db
    .select()
    .from(projectMilestoneSubmissions)
    .where(eq(projectMilestoneSubmissions.id, submissionId))
    .limit(1)
  if (!submission) throw notFound('Submission not found')

  const [instanceMilestone] = await db
    .select()
    .from(projectInstanceMilestones)
    .where(eq(projectInstanceMilestones.id, submission.instanceMilestoneId))
    .limit(1)
  if (!instanceMilestone) throw notFound('Milestone not found')

  const [instance] = await db
    .select()
    .from(projectInstances)
    .where(eq(projectInstances.id, instanceMilestone.instanceId))
    .limit(1)
  if (!instance) throw notFound('Project not found')
  await assertCourseManage(ctx, instance.courseId)

  let instanceCompleted = false
  await db.transaction(async (tx) => {
    await tx
      .update(projectMilestoneSubmissions)
      .set({
        reviewerId: ctx.profile.id,
        decision: input.decision,
        feedback: input.feedback?.trim() || null,
        reviewedAt: new Date(),
      })
      .where(eq(projectMilestoneSubmissions.id, submissionId))

    await tx
      .update(projectInstanceMilestones)
      .set({
        status: input.decision === 'approved' ? 'approved' : 'changes_requested',
        reviewedAt: new Date(),
      })
      .where(eq(projectInstanceMilestones.id, instanceMilestone.id))

    if (input.decision === 'approved') {
      const allInstanceMilestones = await tx
        .select()
        .from(projectInstanceMilestones)
        .where(eq(projectInstanceMilestones.instanceId, instance.id))
      const nextLocked = allInstanceMilestones.find(
        (milestone) => milestone.status === 'locked'
      )
      if (nextLocked) {
        await tx
          .update(projectInstanceMilestones)
          .set({ status: 'available' })
          .where(eq(projectInstanceMilestones.id, nextLocked.id))
      }

      const requiredMilestones = await tx
        .select({
          instanceMilestone: projectInstanceMilestones,
          isRequired: projectMilestones.isRequired,
        })
        .from(projectInstanceMilestones)
        .innerJoin(
          projectMilestones,
          eq(projectMilestones.id, projectInstanceMilestones.milestoneId)
        )
        .where(eq(projectInstanceMilestones.instanceId, instance.id))

      const allRequiredApproved = requiredMilestones
        .filter((row) => row.isRequired)
        .every((row) => row.instanceMilestone.status === 'approved')

      if (allRequiredApproved) {
        await tx
          .update(projectInstances)
          .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
          .where(eq(projectInstances.id, instance.id))
        instanceCompleted = true
      }
    }
  })

  await recordAudit(ctx, {
    action: 'project.milestone.reviewed',
    resourceType: 'project_instance',
    resourceId: instance.id,
    metadata: { submissionId, decision: input.decision },
  })

  const approved = input.decision === 'approved'
  await createNotification({
    profileId: instance.studentId,
    type: 'project_milestone_reviewed',
    title: instanceCompleted
      ? 'Project completed'
      : approved
      ? 'Project milestone approved'
      : 'Project milestone needs changes',
    body: instanceCompleted
      ? 'All required project milestones are approved.'
      : approved
      ? 'Your next milestone is now available.'
      : 'Review the feedback and resubmit this milestone.',
    linkUrl: `/student/projects/${instance.id}`,
    dedupeKey: `project-milestone-review:${submissionId}`,
    metadata: {
      instanceId: instance.id,
      instanceMilestoneId: instanceMilestone.id,
      submissionId,
      decision: input.decision,
    },
  })

  return { success: true }
}
