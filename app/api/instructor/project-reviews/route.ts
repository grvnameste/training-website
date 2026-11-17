import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { listProjectReviewQueue } from '@/lib/services/project-service'

export async function GET() {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const submissions = await listProjectReviewQueue(authResult.context)
    return NextResponse.json({ submissions })
  } catch (error) {
    return toErrorResponse(error)
  }
}
