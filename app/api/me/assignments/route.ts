import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { listStudentAssignments } from '@/lib/services/assignment-service'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const assignments = await listStudentAssignments(authResult.context)
    return NextResponse.json({ assignments })
  } catch (error) {
    return toErrorResponse(error)
  }
}
