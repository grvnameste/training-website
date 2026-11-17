import { and, asc, eq, max } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  courses,
  lessonBlocks,
  lessonResources,
  lessons,
  lessonTranscripts,
  sections,
} from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import { badRequest, notFound } from '@/lib/http/errors'
import { assertCourseManage } from './course-access-service'

export async function getLessonCourse(lessonId: string) {
  const [row] = await db
    .select({
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      courseId: courses.id,
      courseTitle: courses.title,
    })
    .from(lessons)
    .innerJoin(sections, eq(sections.id, lessons.sectionId))
    .innerJoin(courses, eq(courses.id, sections.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1)
  return row ?? null
}

export async function assertLessonManage(ctx: AuthContext, lessonId: string) {
  const row = await getLessonCourse(lessonId)
  if (!row) throw notFound('Lesson not found')
  await assertCourseManage(ctx, row.courseId)
  return row
}

export async function createCourse(
  ctx: AuthContext,
  input: {
    title: string
    subtitle?: string | null
    description?: string | null
    price?: number
    level?: 'beginner' | 'intermediate' | 'advanced'
  }
) {
  const companyId =
    ctx.companies[0]?.id ?? ctx.profile.company_id ?? null

  const [course] = await db
    .insert(courses)
    .values({
      teacherId: ctx.profile.id,
      companyId,
      title: input.title,
      subtitle: input.subtitle ?? null,
      description: input.description ?? null,
      price: String(input.price ?? 0),
      level: input.level ?? 'beginner',
      status: 'draft',
      isCapstone: false,
    })
    .returning({ id: courses.id, title: courses.title })

  return course
}

export async function addSection(ctx: AuthContext, courseId: string, title: string) {
  await assertCourseManage(ctx, courseId)
  const [existing] = await db
    .select({ value: max(sections.orderIndex) })
    .from(sections)
    .where(eq(sections.courseId, courseId))

  const [section] = await db
    .insert(sections)
    .values({
      courseId,
      title,
      orderIndex: (existing?.value ?? -1) + 1,
    })
    .returning()
  return section
}

export async function deleteSection(ctx: AuthContext, sectionId: string) {
  const [section] = await db
    .select({ courseId: sections.courseId })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1)
  if (!section) throw notFound('Section not found')
  await assertCourseManage(ctx, section.courseId)
  await db.delete(sections).where(eq(sections.id, sectionId))
}

export async function addLesson(
  ctx: AuthContext,
  sectionId: string,
  input: { title: string; estimatedMinutes?: number | null }
) {
  const [section] = await db
    .select({ courseId: sections.courseId })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1)
  if (!section) throw notFound('Section not found')
  await assertCourseManage(ctx, section.courseId)

  const [existing] = await db
    .select({ value: max(lessons.orderIndex) })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId))

  const [lesson] = await db
    .insert(lessons)
    .values({
      sectionId,
      title: input.title,
      orderIndex: (existing?.value ?? -1) + 1,
      estimatedMinutes: input.estimatedMinutes ?? null,
      completionMode: 'manual',
    })
    .returning()
  return lesson
}

export async function deleteLesson(ctx: AuthContext, lessonId: string) {
  await assertLessonManage(ctx, lessonId)
  await db.delete(lessons).where(eq(lessons.id, lessonId))
}

export async function getCourseContent(ctx: AuthContext, courseId: string) {
  const course = await assertCourseManage(ctx, courseId)
  const sectionRows = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(asc(sections.orderIndex))

  const lessonRows = await db
    .select({
      id: lessons.id,
      sectionId: lessons.sectionId,
      title: lessons.title,
      summary: lessons.summary,
      description: lessons.description,
      orderIndex: lessons.orderIndex,
      estimatedMinutes: lessons.estimatedMinutes,
      completionMode: lessons.completionMode,
      isPreview: lessons.isPreview,
      objectives: lessons.objectives,
      duration: lessons.duration,
    })
    .from(lessons)
    .innerJoin(sections, eq(sections.id, lessons.sectionId))
    .where(eq(sections.courseId, courseId))
    .orderBy(asc(sections.orderIndex), asc(lessons.orderIndex))

  return {
    course: {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      level: course.level,
      estimatedMinutes: course.estimatedMinutes,
      outcomes: course.outcomes,
      prerequisites: course.prerequisites,
      tags: course.tags,
      whatYouBuild: course.whatYouBuild,
      certificateEnabled: course.certificateEnabled,
      status: course.status,
    },
    sections: sectionRows.map((section) => ({
      ...section,
      lessons: lessonRows.filter((lesson) => lesson.sectionId === section.id),
    })),
  }
}

export async function updateCourseMetadata(
  ctx: AuthContext,
  courseId: string,
  input: {
    title?: string
    subtitle?: string | null
    description?: string | null
    level?: 'beginner' | 'intermediate' | 'advanced'
    estimatedMinutes?: number | null
    outcomes?: string[]
    prerequisites?: string[]
    tags?: string[]
    whatYouBuild?: string | null
    certificateEnabled?: boolean
    thumbnailUrl?: string | null
  }
) {
  await assertCourseManage(ctx, courseId)
  const [updated] = await db
    .update(courses)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.level !== undefined ? { level: input.level } : {}),
      ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {}),
      ...(input.outcomes !== undefined ? { outcomes: input.outcomes } : {}),
      ...(input.prerequisites !== undefined ? { prerequisites: input.prerequisites } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.whatYouBuild !== undefined ? { whatYouBuild: input.whatYouBuild } : {}),
      ...(input.certificateEnabled !== undefined
        ? { certificateEnabled: input.certificateEnabled }
        : {}),
      ...(input.thumbnailUrl !== undefined ? { thumbnailUrl: input.thumbnailUrl } : {}),
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId))
    .returning({ id: courses.id })

  return updated
}

export async function updateLessonSettings(
  ctx: AuthContext,
  lessonId: string,
  input: {
    title?: string
    summary?: string | null
    objectives?: string[]
    estimatedMinutes?: number | null
    completionMode?: 'manual' | 'video_ended'
    isPreview?: boolean
    videoUrl?: string | null
  }
) {
  await assertLessonManage(ctx, lessonId)
  const [updated] = await db
    .update(lessons)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.objectives !== undefined ? { objectives: input.objectives } : {}),
      ...(input.estimatedMinutes !== undefined
        ? { estimatedMinutes: input.estimatedMinutes }
        : {}),
      ...(input.completionMode !== undefined
        ? { completionMode: input.completionMode }
        : {}),
      ...(input.isPreview !== undefined ? { isPreview: input.isPreview } : {}),
      ...(input.videoUrl !== undefined ? { videoUrl: input.videoUrl } : {}),
    })
    .where(eq(lessons.id, lessonId))
    .returning({ id: lessons.id })
  return updated
}

export async function listLessonBlocks(ctx: AuthContext, lessonId: string) {
  await assertLessonManage(ctx, lessonId)
  return db
    .select()
    .from(lessonBlocks)
    .where(eq(lessonBlocks.lessonId, lessonId))
    .orderBy(asc(lessonBlocks.position))
}

export async function createLessonBlock(
  ctx: AuthContext,
  lessonId: string,
  input: { type: string; content: Record<string, unknown> }
) {
  await assertLessonManage(ctx, lessonId)
  const [{ value }] = await db
    .select({ value: max(lessonBlocks.position) })
    .from(lessonBlocks)
    .where(eq(lessonBlocks.lessonId, lessonId))

  const [block] = await db
    .insert(lessonBlocks)
    .values({
      lessonId,
      type: input.type,
      content: input.content,
      position: (value ?? -1) + 1,
    })
    .returning()
  return block
}

export async function updateLessonBlock(
  ctx: AuthContext,
  blockId: string,
  input: { type?: string; content?: Record<string, unknown> }
) {
  const [existing] = await db
    .select({ lessonId: lessonBlocks.lessonId })
    .from(lessonBlocks)
    .where(eq(lessonBlocks.id, blockId))
    .limit(1)
  if (!existing) throw notFound('Block not found')
  await assertLessonManage(ctx, existing.lessonId)

  const [updated] = await db
    .update(lessonBlocks)
    .set({
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      updatedAt: new Date(),
    })
    .where(eq(lessonBlocks.id, blockId))
    .returning()
  return updated
}

export async function deleteLessonBlock(ctx: AuthContext, blockId: string) {
  const [existing] = await db
    .select({ lessonId: lessonBlocks.lessonId })
    .from(lessonBlocks)
    .where(eq(lessonBlocks.id, blockId))
    .limit(1)
  if (!existing) throw notFound('Block not found')
  await assertLessonManage(ctx, existing.lessonId)
  await db.delete(lessonBlocks).where(eq(lessonBlocks.id, blockId))
}

export async function reorderLessonBlocks(
  ctx: AuthContext,
  lessonId: string,
  orderedIds: string[]
) {
  await assertLessonManage(ctx, lessonId)
  const existing = await db
    .select({ id: lessonBlocks.id })
    .from(lessonBlocks)
    .where(eq(lessonBlocks.lessonId, lessonId))

  const existingIds = new Set(existing.map((row) => row.id))
  if (orderedIds.length !== existing.length || orderedIds.some((id) => !existingIds.has(id))) {
    throw badRequest('Block order does not match the lesson blocks')
  }

  await db.transaction(async (tx) => {
    for (let index = 0; index < orderedIds.length; index++) {
      await tx
        .update(lessonBlocks)
        .set({ position: index, updatedAt: new Date() })
        .where(eq(lessonBlocks.id, orderedIds[index]))
    }
  })
}

export async function listLessonResources(ctx: AuthContext, lessonId: string) {
  await assertLessonManage(ctx, lessonId)
  return db
    .select()
    .from(lessonResources)
    .where(eq(lessonResources.lessonId, lessonId))
    .orderBy(asc(lessonResources.position))
}

export async function createLessonResource(
  ctx: AuthContext,
  lessonId: string,
  input: {
    title: string
    kind: 'link' | 'download'
    externalUrl?: string | null
    storagePath?: string | null
    fileName?: string | null
    mimeType?: string | null
    sizeBytes?: number | null
  }
) {
  await assertLessonManage(ctx, lessonId)
  const [resource] = await db
    .insert(lessonResources)
    .values({
      lessonId,
      title: input.title,
      kind: input.kind,
      externalUrl: input.externalUrl ?? null,
      storagePath: input.storagePath ?? null,
      fileName: input.fileName ?? null,
      mimeType: input.mimeType ?? null,
      sizeBytes: input.sizeBytes ?? null,
    })
    .returning()
  return resource
}

export async function deleteLessonResource(ctx: AuthContext, resourceId: string) {
  const [existing] = await db
    .select({ lessonId: lessonResources.lessonId })
    .from(lessonResources)
    .where(eq(lessonResources.id, resourceId))
    .limit(1)
  if (!existing) throw notFound('Resource not found')
  await assertLessonManage(ctx, existing.lessonId)
  await db.delete(lessonResources).where(eq(lessonResources.id, resourceId))
}

export async function upsertLessonTranscript(
  ctx: AuthContext,
  lessonId: string,
  input: { fullText: string; language?: string; segments?: unknown[] }
) {
  await assertLessonManage(ctx, lessonId)
  const [transcript] = await db
    .insert(lessonTranscripts)
    .values({
      lessonId,
      fullText: input.fullText,
      language: input.language ?? 'en',
      segments: input.segments ?? [],
    })
    .onConflictDoUpdate({
      target: lessonTranscripts.lessonId,
      set: {
        fullText: input.fullText,
        language: input.language ?? 'en',
        segments: input.segments ?? [],
        updatedAt: new Date(),
      },
    })
    .returning()
  return transcript
}
