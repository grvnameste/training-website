import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  courseEnrollments,
  courses,
  entitlements,
  profiles,
  studentPreferences,
} from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'

export interface StudentPreferenceInput {
  goal?: string | null
  level?: 'beginner' | 'intermediate' | 'advanced' | null
  weeklyMinutes?: number | null
  preferredTopics?: string[]
}

export async function getPreferences(studentId: string) {
  const [preferences] = await db
    .select()
    .from(studentPreferences)
    .where(eq(studentPreferences.studentId, studentId))
    .limit(1)
  return preferences ?? null
}

export async function upsertPreferences(
  studentId: string,
  input: StudentPreferenceInput
) {
  const [preferences] = await db
    .insert(studentPreferences)
    .values({
      studentId,
      goal: input.goal ?? null,
      level: input.level ?? null,
      weeklyMinutes: input.weeklyMinutes ?? null,
      preferredTopics: input.preferredTopics ?? [],
      onboardingCompletedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: studentPreferences.studentId,
      set: {
        goal: input.goal ?? null,
        level: input.level ?? null,
        weeklyMinutes: input.weeklyMinutes ?? null,
        preferredTopics: input.preferredTopics ?? [],
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning()
  return preferences
}

function skillNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && 'name' in item) {
        return String((item as { name?: unknown }).name ?? '')
      }
      return ''
    })
    .filter(Boolean)
}

export async function getRecommendations(ctx: AuthContext, limit = 6) {
  const [preferences, profileRow, enrolledRows, entitlementRows, courseRows] =
    await Promise.all([
      getPreferences(ctx.profile.id),
      db
        .select({ skills: profiles.skills })
        .from(profiles)
        .where(eq(profiles.id, ctx.profile.id))
        .limit(1),
      db
        .select({ courseId: courseEnrollments.courseId })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.studentId, ctx.profile.id)),
      db
        .select({ courseId: entitlements.courseId })
        .from(entitlements)
        .where(
          and(
            eq(entitlements.studentId, ctx.profile.id),
            eq(entitlements.status, 'active')
          )
        ),
      db
        .select({
          id: courses.id,
          title: courses.title,
          subtitle: courses.subtitle,
          description: courses.description,
          thumbnailUrl: courses.thumbnailUrl,
          price: courses.price,
          level: courses.level,
          estimatedMinutes: courses.estimatedMinutes,
          tags: courses.tags,
          outcomes: courses.outcomes,
          createdAt: courses.createdAt,
        })
        .from(courses)
        .where(and(eq(courses.status, 'published'), eq(courses.isCapstone, false)))
        .orderBy(desc(courses.createdAt)),
    ])

  const excluded = new Set([
    ...enrolledRows.map((row) => row.courseId),
    ...entitlementRows.map((row) => row.courseId),
  ])

  const preferredTopics = (preferences?.preferredTopics ?? []).map((topic) =>
    topic.toLowerCase()
  )
  const skills = skillNames(profileRow[0]?.skills).map((skill) => skill.toLowerCase())
  const preferredLevel = preferences?.level ?? null

  const scored = courseRows
    .filter((course) => !excluded.has(course.id))
    .map((course) => {
      const haystack = [
        course.title,
        course.subtitle ?? '',
        course.description ?? '',
        ...(course.tags ?? []),
        ...(course.outcomes ?? []),
      ]
        .join(' ')
        .toLowerCase()

      let score = 0
      const reasons: string[] = []

      const matchedTopics = preferredTopics.filter((topic) => haystack.includes(topic))
      if (matchedTopics.length > 0) {
        score += matchedTopics.length * 3
        reasons.push(`Matches ${matchedTopics.slice(0, 2).join(', ')}`)
      }

      const matchedSkills = skills.filter((skill) => haystack.includes(skill))
      if (matchedSkills.length > 0) {
        score += matchedSkills.length * 2
        reasons.push(`Builds on ${matchedSkills.slice(0, 2).join(', ')}`)
      }

      if (preferredLevel && course.level === preferredLevel) {
        score += 2
        reasons.push(`Fits your ${preferredLevel} level`)
      }

      if (Number(course.price ?? 0) === 0) score += 0.5

      return { ...course, price: Number(course.price ?? 0), score, reasons }
    })
    .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)

  return {
    preferences,
    recommendations: scored.map(({ score, reasons, createdAt, ...course }) => ({
      ...course,
      reason: reasons[0] ?? 'Recommended next step',
    })),
  }
}
