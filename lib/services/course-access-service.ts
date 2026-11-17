import { and, eq, gt, inArray, isNull, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { companies, courses, entitlements } from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import { forbidden, notFound } from '@/lib/http/errors'

export type CourseRecord = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  teacherId: string | null
  companyId: string | null
  price: string | null
  thumbnailUrl: string | null
  isCapstone: boolean
  parentCourseId: string | null
  status: string
  publishedAt: Date | null
  level: string
  estimatedMinutes: number | null
  outcomes: string[]
  prerequisites: string[]
  tags: string[]
  whatYouBuild: string | null
  language: string
  certificateEnabled: boolean
  createdAt: Date
}

export async function getCourseById(courseId: string): Promise<CourseRecord | null> {
  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      subtitle: courses.subtitle,
      description: courses.description,
      teacherId: courses.teacherId,
      companyId: courses.companyId,
      price: courses.price,
      thumbnailUrl: courses.thumbnailUrl,
      isCapstone: courses.isCapstone,
      parentCourseId: courses.parentCourseId,
      status: courses.status,
      publishedAt: courses.publishedAt,
      level: courses.level,
      estimatedMinutes: courses.estimatedMinutes,
      outcomes: courses.outcomes,
      prerequisites: courses.prerequisites,
      tags: courses.tags,
      whatYouBuild: courses.whatYouBuild,
      language: courses.language,
      certificateEnabled: courses.certificateEnabled,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)

  return course ?? null
}

export function isFreeCourse(course: Pick<CourseRecord, 'price'>): boolean {
  return Number(course.price ?? 0) === 0
}

export async function getPlatformCompanyId(): Promise<string | null> {
  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.slug, 'readnrevise'))
    .limit(1)
  return company?.id ?? null
}

export function isSuperAdmin(ctx: AuthContext): boolean {
  return ctx.role === 'super_admin'
}

export function canManageCompany(ctx: AuthContext, companyId: string | null): boolean {
  if (isSuperAdmin(ctx)) return true
  if (!companyId) return false
  return ctx.companies.some(
    (company) =>
      company.id === companyId &&
      (company.role === 'org_admin' || company.role === 'instructor')
  )
}

export function canManageCourse(ctx: AuthContext, course: CourseRecord): boolean {
  if (isSuperAdmin(ctx)) return true
  if (course.teacherId && course.teacherId === ctx.profile.id) return true
  return canManageCompany(ctx, course.companyId)
}

export async function assertCourseManage(ctx: AuthContext, courseId: string): Promise<CourseRecord> {
  const course = await getCourseById(courseId)
  if (!course) throw notFound('Course not found')
  if (!canManageCourse(ctx, course)) throw notFound('Course not found')
  return course
}

export async function getActiveEntitlement(
  studentId: string,
  courseId: string
) {
  const now = new Date()
  const [entitlement] = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.studentId, studentId),
        eq(entitlements.courseId, courseId),
        eq(entitlements.status, 'active'),
        or(isNull(entitlements.expiresAt), gt(entitlements.expiresAt, now))
      )
    )
    .limit(1)

  return entitlement ?? null
}

export async function hasCourseEntitlement(
  studentId: string,
  course: Pick<CourseRecord, 'id' | 'isCapstone' | 'parentCourseId'>
): Promise<boolean> {
  if (await getActiveEntitlement(studentId, course.id)) return true
  if (course.isCapstone && course.parentCourseId) {
    return Boolean(await getActiveEntitlement(studentId, course.parentCourseId))
  }
  return false
}

export async function assertCourseLearn(
  ctx: AuthContext,
  course: CourseRecord
): Promise<void> {
  if (canManageCourse(ctx, course)) return
  if (await hasCourseEntitlement(ctx.profile.id, course)) return
  throw forbidden('You do not have access to this course')
}

export async function listEntitledCourseIds(studentId: string): Promise<string[]> {
  const now = new Date()
  const rows = await db
    .select({ courseId: entitlements.courseId })
    .from(entitlements)
    .where(
      and(
        eq(entitlements.studentId, studentId),
        eq(entitlements.status, 'active'),
        or(isNull(entitlements.expiresAt), gt(entitlements.expiresAt, now))
      )
    )

  return rows.map((row) => row.courseId)
}

export async function coursesByIds(ids: string[]) {
  if (ids.length === 0) return []
  return db
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
      status: courses.status,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .where(and(inArray(courses.id, ids), eq(courses.status, 'published')))
}
