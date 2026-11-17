import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import { assertCourseManage } from '@/lib/services/course-access-service'
import { recordAudit } from '@/lib/services/audit-service'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { courseId } = await params
    const course = await assertCourseManage(authResult.context, courseId)

    await db
      .update(courses)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(courses.id, courseId))

    await recordAudit(authResult.context, {
      action: 'course.archived',
      resourceType: 'course',
      resourceId: courseId,
      companyId: course.companyId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
