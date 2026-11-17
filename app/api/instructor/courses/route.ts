import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { createCourse } from '@/lib/services/authoring-service'

const createSchema = z.object({
  title: z.string().min(2).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(10_000).optional(),
  price: z.number().min(0).max(10_000_000).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
})

export async function GET() {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const isSuperAdmin = authResult.context.role === 'super_admin'
    const rows = await db
      .select({
        id: courses.id,
        title: courses.title,
        subtitle: courses.subtitle,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        status: courses.status,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(
        isSuperAdmin
          ? eq(courses.isCapstone, false)
          : and(
              eq(courses.isCapstone, false),
              eq(courses.teacherId, authResult.context.profile.id)
            )
      )
      .orderBy(desc(courses.createdAt))

    return NextResponse.json({
      courses: rows.map((course) => ({
        ...course,
        price: Number(course.price ?? 0),
      })),
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const parsed = createSchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid course', parsed.error.flatten())

    const course = await createCourse(authResult.context, parsed.data)
    return NextResponse.json({ success: true, course }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
