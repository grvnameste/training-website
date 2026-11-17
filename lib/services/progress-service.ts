import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  courseEnrollments,
  courses,
  lessonCompletions,
  lessonPlayback,
  lessons,
  sections,
  studentLessonProgress,
} from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import { badRequest, notFound } from '@/lib/http/errors'
import { assertCourseLearn, getCourseById } from './course-access-service'

export interface CourseProgressSummary {
  totalLessons: number
  completedLessons: number
  percentage: number
  completedLessonIds: string[]
  nextLessonId: string | null
  resumeLessonId: string | null
  resumePositionSeconds: number
}

export async function getOrderedCourseLessons(courseId: string) {
  return db
    .select({
      id: lessons.id,
      title: lessons.title,
      sectionId: lessons.sectionId,
      sectionTitle: sections.title,
      sectionOrder: sections.orderIndex,
      lessonOrder: lessons.orderIndex,
      videoUrl: lessons.videoUrl,
      duration: lessons.duration,
    })
    .from(lessons)
    .innerJoin(sections, eq(sections.id, lessons.sectionId))
    .where(eq(sections.courseId, courseId))
    .orderBy(asc(sections.orderIndex), asc(lessons.orderIndex))
}

async function getCompletedLessonIds(studentId: string, courseId: string) {
  const rows = await db
    .select({ lessonId: lessonCompletions.lessonId })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.studentId, studentId),
        eq(lessonCompletions.courseId, courseId)
      )
    )
  return rows.map((row) => row.lessonId)
}

async function getLastPlayback(studentId: string, courseId: string) {
  const [row] = await db
    .select()
    .from(lessonPlayback)
    .where(
      and(eq(lessonPlayback.studentId, studentId), eq(lessonPlayback.courseId, courseId))
    )
    .orderBy(desc(lessonPlayback.updatedAt))
    .limit(1)
  return row ?? null
}

export async function getCourseProgress(
  studentId: string,
  courseId: string
): Promise<CourseProgressSummary> {
  const [orderedLessons, completedLessonIds, playback] = await Promise.all([
    getOrderedCourseLessons(courseId),
    getCompletedLessonIds(studentId, courseId),
    getLastPlayback(studentId, courseId),
  ])

  const completedSet = new Set(completedLessonIds)
  const totalLessons = orderedLessons.length
  const completedLessons = orderedLessons.filter((lesson) => completedSet.has(lesson.id)).length
  const nextLesson = orderedLessons.find((lesson) => !completedSet.has(lesson.id)) ?? null
  const playbackLesson =
    playback &&
    orderedLessons.some((lesson) => lesson.id === playback.lessonId) &&
    !completedSet.has(playback.lessonId)
      ? playback.lessonId
      : null

  return {
    totalLessons,
    completedLessons,
    percentage: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    completedLessonIds,
    nextLessonId: nextLesson?.id ?? null,
    resumeLessonId: playbackLesson ?? nextLesson?.id ?? orderedLessons[0]?.id ?? null,
    resumePositionSeconds: playbackLesson ? playback?.positionSeconds ?? 0 : 0,
  }
}

export async function getLessonCourseId(lessonId: string): Promise<string | null> {
  const [row] = await db
    .select({ courseId: sections.courseId })
    .from(lessons)
    .innerJoin(sections, eq(sections.id, lessons.sectionId))
    .where(eq(lessons.id, lessonId))
    .limit(1)
  return row?.courseId ?? null
}

async function assertLessonInCourse(courseId: string, lessonId: string) {
  const [row] = await db
    .select({ id: lessons.id, courseId: sections.courseId })
    .from(lessons)
    .innerJoin(sections, eq(sections.id, lessons.sectionId))
    .where(and(eq(lessons.id, lessonId), eq(sections.courseId, courseId)))
    .limit(1)

  if (!row) throw badRequest('Lesson does not belong to this course')
}

export async function completeLesson(
  ctx: AuthContext,
  input: { courseId: string; lessonId: string; source?: string }
): Promise<CourseProgressSummary> {
  const course = await getCourseById(input.courseId)
  if (!course) throw notFound('Course not found')
  await assertCourseLearn(ctx, course)
  await assertLessonInCourse(input.courseId, input.lessonId)

  await db.transaction(async (tx) => {
    await tx
      .insert(lessonCompletions)
      .values({
        studentId: ctx.profile.id,
        courseId: input.courseId,
        lessonId: input.lessonId,
        source: input.source === 'video_ended' ? 'video_ended' : 'explicit',
      })
      .onConflictDoNothing({
        target: [lessonCompletions.studentId, lessonCompletions.lessonId],
      })

    await tx
      .insert(studentLessonProgress)
      .values({
        studentId: ctx.profile.id,
        courseId: input.courseId,
        lessonId: input.lessonId,
      })
      .onConflictDoUpdate({
        target: [studentLessonProgress.studentId, studentLessonProgress.courseId],
        set: { lessonId: input.lessonId, updatedAt: new Date() },
      })
  })

  return getCourseProgress(ctx.profile.id, input.courseId)
}

export async function saveLessonPosition(
  ctx: AuthContext,
  input: {
    courseId: string
    lessonId: string
    positionSeconds: number
    durationSeconds?: number | null
  }
) {
  const course = await getCourseById(input.courseId)
  if (!course) throw notFound('Course not found')
  await assertCourseLearn(ctx, course)
  await assertLessonInCourse(input.courseId, input.lessonId)

  const position = Math.max(0, Math.floor(input.positionSeconds || 0))
  const duration =
    typeof input.durationSeconds === 'number' && input.durationSeconds > 0
      ? Math.floor(input.durationSeconds)
      : null

  await db
    .insert(lessonPlayback)
    .values({
      studentId: ctx.profile.id,
      courseId: input.courseId,
      lessonId: input.lessonId,
      positionSeconds: position,
      durationSeconds: duration,
    })
    .onConflictDoUpdate({
      target: [lessonPlayback.studentId, lessonPlayback.lessonId],
      set: {
        positionSeconds: position,
        durationSeconds: duration,
        updatedAt: new Date(),
      },
    })

  return { success: true, positionSeconds: position }
}

export async function getEnrolledCoursesWithProgress(studentId: string) {
  const rows = await db
    .select({
      courseId: courses.id,
      title: courses.title,
      description: courses.description,
      thumbnailUrl: courses.thumbnailUrl,
      price: courses.price,
      enrolledAt: courseEnrollments.enrolledAt,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courses.id, courseEnrollments.courseId))
    .where(
      and(eq(courseEnrollments.studentId, studentId), eq(courses.status, 'published'))
    )

  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      progress: await getCourseProgress(studentId, row.courseId),
    }))
  )
}
