import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studentActivity } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const rows = await db
      .select({
        id: studentActivity.id,
        type: studentActivity.type,
        createdAt: studentActivity.createdAt,
      })
      .from(studentActivity)
      .where(eq(studentActivity.studentId, authResult.context.profile.id))
      .orderBy(desc(studentActivity.createdAt))
      .limit(100)

    return NextResponse.json({ activity: rows })
  } catch (error) {
    return toErrorResponse(error)
  }
}
