import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  courseEnrollments,
  courses,
  entitlements,
  profiles,
} from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import { badRequest, conflict, notFound } from '@/lib/http/errors'
import {
  assertCourseManage,
  getActiveEntitlement,
  getCourseById,
  isFreeCourse,
} from './course-access-service'
import { getOrderedCourseLessons, getCourseProgress } from './progress-service'
import { recordAudit } from './audit-service'

async function createEnrollmentAndEntitlement(input: {
  studentId: string
  studentFirstName?: string | null
  studentLastName?: string | null
  course: {
    id: string
    title: string
    companyId: string | null
  }
  source: 'self' | 'admin' | 'org'
  grantedBy?: string | null
}) {
  return db.transaction(async (tx) => {
    await tx
      .insert(entitlements)
      .values({
        studentId: input.studentId,
        courseId: input.course.id,
        companyId: input.course.companyId,
        source: input.source,
        status: 'active',
        grantedBy: input.grantedBy ?? null,
      })
      .onConflictDoNothing()

    await tx
      .insert(courseEnrollments)
      .values({
        studentId: input.studentId,
        courseId: input.course.id,
        companyId: input.course.companyId,
        status: 'active',
        studentFirstName: input.studentFirstName ?? null,
        studentLastName: input.studentLastName ?? null,
        courseTitle: input.course.title,
      })
      .onConflictDoNothing({
        target: [courseEnrollments.studentId, courseEnrollments.courseId],
      })
  })
}

export async function enrollInFreeCourse(ctx: AuthContext, courseId: string) {
  const course = await getCourseById(courseId)
  if (!course || course.status !== 'published') throw notFound('Course not found')
  if (course.isCapstone) {
    throw badRequest('Enroll in the parent course; the capstone is unlocked through it')
  }
  if (!isFreeCourse(course)) {
    throw conflict(
      'PAYMENT_REQUIRED',
      'This is a paid course. Contact the institute to request enrollment.'
    )
  }

  const existing = await getActiveEntitlement(ctx.profile.id, courseId)
  if (!existing) {
    await createEnrollmentAndEntitlement({
      studentId: ctx.profile.id,
      studentFirstName: ctx.profile.first_name ?? null,
      studentLastName: ctx.profile.last_name ?? null,
      course,
      source: 'self',
    })

    await recordAudit(ctx, {
      action: 'entitlement.granted',
      resourceType: 'course',
      resourceId: course.id,
      companyId: course.companyId,
      metadata: { source: 'self', price: course.price },
    })
  }

  const [orderedLessons, progress] = await Promise.all([
    getOrderedCourseLessons(courseId),
    getCourseProgress(ctx.profile.id, courseId),
  ])

  return {
    success: true,
    courseId,
    firstLessonId: orderedLessons[0]?.id ?? null,
    progress,
  }
}

export async function grantEntitlement(
  ctx: AuthContext,
  input: { studentId: string; courseId: string; source?: 'admin' | 'org' }
) {
  const course = await assertCourseManage(ctx, input.courseId)
  const [student] = await db
    .select({
      id: profiles.id,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
    })
    .from(profiles)
    .where(eq(profiles.id, input.studentId))
    .limit(1)

  if (!student) throw notFound('Student not found')

  const existing = await getActiveEntitlement(student.id, course.id)
  if (!existing) {
    await createEnrollmentAndEntitlement({
      studentId: student.id,
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      course,
      source: input.source ?? 'admin',
      grantedBy: ctx.userId,
    })

    await recordAudit(ctx, {
      action: 'entitlement.granted',
      resourceType: 'course',
      resourceId: course.id,
      companyId: course.companyId,
      metadata: { studentId: student.id, source: input.source ?? 'admin' },
    })
  }

  return { success: true, studentId: student.id, courseId: course.id }
}

export async function getCatalogCourse(courseId: string) {
  const course = await getCourseById(courseId)
  if (!course || course.status !== 'published') return null
  return {
    ...course,
    price: Number(course.price ?? 0),
  }
}

export async function listPublishedCourses(input?: {
  search?: string
  level?: string
  topic?: string
  price?: string
  limit?: number
}) {
  const limit = Math.min(Math.max(input?.limit ?? 60, 1), 100)
  const search = input?.search?.trim().toLowerCase()
  const level = input?.level?.trim()
  const topic = input?.topic?.trim().toLowerCase()
  const price = input?.price?.trim()

  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      subtitle: courses.subtitle,
      description: courses.description,
      price: courses.price,
      thumbnailUrl: courses.thumbnailUrl,
      teacherId: courses.teacherId,
      companyId: courses.companyId,
      isCapstone: courses.isCapstone,
      parentCourseId: courses.parentCourseId,
      level: courses.level,
      estimatedMinutes: courses.estimatedMinutes,
      outcomes: courses.outcomes,
      tags: courses.tags,
      certificateEnabled: courses.certificateEnabled,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .where(eq(courses.status, 'published'))
    .orderBy(desc(courses.createdAt))

  return rows
    .filter((course) => !course.isCapstone)
    .map((course) => ({ ...course, price: Number(course.price ?? 0) }))
    .filter((course) => {
      if (level && course.level !== level) return false
      if (topic && !(course.tags || []).some((tag) => tag.toLowerCase().includes(topic))) {
        return false
      }
      if (price === 'free' && course.price !== 0) return false
      if (price === 'paid' && course.price === 0) return false
      if (!search) return true
      return `${course.title} ${course.subtitle ?? ''} ${course.description ?? ''} ${(course.tags || []).join(' ')}`
        .toLowerCase()
        .includes(search)
    })
    .slice(0, limit)
}
