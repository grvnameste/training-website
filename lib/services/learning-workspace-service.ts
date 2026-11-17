import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  courses,
  lessonBlocks,
  lessonNotes,
  lessonResources,
  lessons,
  lessonTranscripts,
  sections,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import { forbidden, notFound } from '@/lib/http/errors'
import {
  assertCourseLearn,
  canManageCourse,
  getCourseById,
  hasCourseEntitlement,
} from './course-access-service'
import { getCourseProgress } from './progress-service'

export async function getLearningWorkspace(
  ctx: AuthContext,
  courseId: string,
  requestedLessonId?: string | null
) {
  const course = await getCourseById(courseId)
  if (!course || course.status !== 'published') throw notFound('Course not found')

  const sectionRows = await db
    .select({
      id: sections.id,
      title: sections.title,
      orderIndex: sections.orderIndex,
    })
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(asc(sections.orderIndex))

  const lessonRows = await db
    .select({
      id: lessons.id,
      sectionId: lessons.sectionId,
      title: lessons.title,
      description: lessons.description,
      summary: lessons.summary,
      objectives: lessons.objectives,
      estimatedMinutes: lessons.estimatedMinutes,
      completionMode: lessons.completionMode,
      isPreview: lessons.isPreview,
      videoUrl: lessons.videoUrl,
      duration: lessons.duration,
      orderIndex: lessons.orderIndex,
    })
    .from(lessons)
    .innerJoin(sections, eq(sections.id, lessons.sectionId))
    .where(eq(sections.courseId, courseId))
    .orderBy(asc(sections.orderIndex), asc(lessons.orderIndex))

  if (lessonRows.length === 0) throw notFound('This course has no lessons yet')

  const progress = await getCourseProgress(ctx.profile.id, course.id)
  const requested = requestedLessonId
    ? lessonRows.find((lesson) => lesson.id === requestedLessonId)
    : null

  if (requestedLessonId && !requested) throw notFound('Lesson not found')

  const lesson =
    requested ??
    lessonRows.find((item) => item.id === progress.resumeLessonId) ??
    lessonRows[0]

  const isPreviewLesson = Boolean(lesson.isPreview)
  const canManage = canManageCourse(ctx, course)
  const entitled =
    canManage || (await hasCourseEntitlement(ctx.profile.id, course))

  if (!entitled && !isPreviewLesson) {
    await assertCourseLearn(ctx, course)
  }
  if (!entitled && isPreviewLesson) {
    const allowed = await isPreviewAccessible(course.id, lesson.id)
    if (!allowed) throw forbidden('You do not have access to this lesson')
  }

  const [blocks, resources, transcript, note] = await Promise.all([
    db
      .select()
      .from(lessonBlocks)
      .where(eq(lessonBlocks.lessonId, lesson.id))
      .orderBy(asc(lessonBlocks.position)),
    db
      .select()
      .from(lessonResources)
      .where(eq(lessonResources.lessonId, lesson.id))
      .orderBy(asc(lessonResources.position)),
    db
      .select()
      .from(lessonTranscripts)
      .where(eq(lessonTranscripts.lessonId, lesson.id))
      .limit(1),
    db
      .select()
      .from(lessonNotes)
      .where(
        and(eq(lessonNotes.studentId, ctx.profile.id), eq(lessonNotes.lessonId, lesson.id))
      )
      .limit(1),
  ])

  let capstone: {
    id: string
    title: string
    currentStage: number
    stage3Submitted: boolean
    completed: boolean
    certificateRequested: boolean
    certificateIssued: boolean
  } | null = null

  if (entitled) {
    const capstoneCourse = course.isCapstone
      ? { id: course.id, title: course.title }
      : (
          await db
            .select({ id: courses.id, title: courses.title })
            .from(courses)
            .where(
              and(
                eq(courses.parentCourseId, course.id),
                eq(courses.isCapstone, true),
                eq(courses.status, 'published')
              )
            )
            .limit(1)
        )[0]

    if (capstoneCourse) {
      const [capstoneProgress] = await db
        .select()
        .from(studentCapstoneProgress)
        .where(
          and(
            eq(studentCapstoneProgress.studentId, ctx.profile.id),
            eq(studentCapstoneProgress.capstoneId, capstoneCourse.id)
          )
        )
        .limit(1)

      capstone = {
        id: capstoneCourse.id,
        title: capstoneCourse.title,
        currentStage: capstoneProgress?.currentStage ?? 1,
        stage3Submitted: Boolean(capstoneProgress?.stage3Submitted),
        completed: Boolean(capstoneProgress?.completed),
        certificateRequested: Boolean(capstoneProgress?.certificateRequested),
        certificateIssued: Boolean(capstoneProgress?.certificateIssued),
      }
    }
  }

  const currentIndex = lessonRows.findIndex((item) => item.id === lesson.id)

  return {
    course: {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      isCapstone: course.isCapstone,
      teacherId: course.teacherId,
    },
    lesson: {
      ...lesson,
      videoUrl: lesson.videoUrl,
      blocks,
      resources: resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        kind: resource.kind,
        fileName: resource.fileName,
        mimeType: resource.mimeType,
        sizeBytes: resource.sizeBytes,
        externalUrl: resource.externalUrl,
        downloadUrl:
          resource.kind === 'download'
            ? `/api/learning/resources/${resource.id}/download`
            : null,
      })),
      transcript: transcript[0]
        ? {
            language: transcript[0].language,
            fullText: transcript[0].fullText,
            segments: transcript[0].segments,
          }
        : null,
      note: note[0]?.content ?? '',
    },
    progress,
    navigation: {
      previousLessonId: lessonRows[currentIndex - 1]?.id ?? null,
      nextLessonId: lessonRows[currentIndex + 1]?.id ?? null,
    },
    curriculum: sectionRows.map((section) => ({
      ...section,
      lessons: lessonRows
        .filter((item) => item.sectionId === section.id)
        .map((item) => ({
          id: item.id,
          title: item.title,
          duration: item.duration,
          isPreview: item.isPreview,
          completed: progress.completedLessonIds.includes(item.id),
        })),
    })),
    canViewFullCourse: entitled,
    capstone,
  }
}

async function isPreviewAccessible(courseId: string, lessonId: string) {
  const [row] = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(sections, eq(sections.id, lessons.sectionId))
    .where(
      and(
        eq(lessons.id, lessonId),
        eq(lessons.isPreview, true),
        eq(sections.courseId, courseId)
      )
    )
    .limit(1)
  return Boolean(row)
}

