import { and, asc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lessons, profiles, sections } from '@/lib/db/schema'
import { toErrorResponse } from '@/lib/http/errors'
import { getCatalogCourse } from '@/lib/services/enrollment-service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const course = await getCatalogCourse(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

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
        summary: lessons.summary,
        duration: lessons.duration,
        orderIndex: lessons.orderIndex,
        isPreview: lessons.isPreview,
      })
      .from(lessons)
      .innerJoin(sections, eq(sections.id, lessons.sectionId))
      .where(eq(sections.courseId, courseId))
      .orderBy(asc(sections.orderIndex), asc(lessons.orderIndex))

    let instructor: { id: string; name: string; avatar: string | null } | null = null
    if (course.teacherId) {
      const [row] = await db
        .select({ id: profiles.id, name: profiles.name, avatar: profiles.avatarUrl })
        .from(profiles)
        .where(eq(profiles.id, course.teacherId))
        .limit(1)
      if (row) {
        instructor = { id: row.id, name: row.name ?? 'Instructor', avatar: row.avatar }
      }
    }

    return NextResponse.json({
      course: {
        ...course,
        sections: sectionRows.map((section) => ({
          ...section,
          lessons: lessonRows.filter((lesson) => lesson.sectionId === section.id),
        })),
        instructor,
        previewLessonId: lessonRows.find((lesson) => lesson.isPreview)?.id ?? null,
      },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
