import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getEnrolledCoursesWithProgress } from '@/lib/services/progress-service'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const courses = await getEnrolledCoursesWithProgress(authResult.context.profile.id)
    return NextResponse.json({ courses })
  } catch (error) {
    return toErrorResponse(error)
  }
}
