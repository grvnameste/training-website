import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { capstoneMeetings } from '@/lib/db/schema'
import { requireAuth, requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, notFound, toErrorResponse } from '@/lib/http/errors'
import { assertCourseManage } from '@/lib/services/course-access-service'

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { searchParams } = new URL(req.url)
    const capstoneId = searchParams.get('capstoneId')
    if (!capstoneId) throw badRequest('capstoneId is required')

    const isStaff = authResult.context.role === 'teacher' || authResult.context.role === 'super_admin'
    if (isStaff) {
      await assertCourseManage(authResult.context, capstoneId)
    }

    const studentId = isStaff
      ? searchParams.get('studentId') || authResult.context.profile.id
      : authResult.context.profile.id

    const [meeting] = await db
      .select()
      .from(capstoneMeetings)
      .where(
        and(
          eq(capstoneMeetings.studentId, studentId),
          eq(capstoneMeetings.capstoneId, capstoneId)
        )
      )
      .limit(1)

    return NextResponse.json(meeting ?? null)
  } catch (error) {
    return toErrorResponse(error)
  }
}

const bodySchema = z.object({
  studentId: z.string().uuid(),
  capstoneId: z.string().uuid(),
  meetingLink: z.string().url(),
  meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meetingTime: z.string().min(1).max(20),
  notes: z.string().max(4000).optional(),
})

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid meeting request', parsed.error.flatten())
    }

    const { studentId, capstoneId, meetingLink, meetingDate, meetingTime, notes } =
      parsed.data

    await assertCourseManage(authResult.context, capstoneId)

    const [meeting] = await db
      .insert(capstoneMeetings)
      .values({
        studentId,
        capstoneId,
        meetingLink,
        meetingDate,
        meetingTime,
        notes: notes ?? null,
      })
      .onConflictDoUpdate({
        target: [capstoneMeetings.studentId, capstoneMeetings.capstoneId],
        set: {
          meetingLink,
          meetingDate,
          meetingTime,
          notes: notes ?? null,
        },
      })
      .returning()

    if (!meeting) throw notFound('Meeting could not be saved')
    return NextResponse.json(meeting)
  } catch (error) {
    return toErrorResponse(error)
  }
}
