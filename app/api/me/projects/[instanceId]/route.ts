import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getStudentProject } from '@/lib/services/project-service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const { instanceId } = await params
    const data = await getStudentProject(authResult.context, instanceId)
    return NextResponse.json(data)
  } catch (error) {
    return toErrorResponse(error)
  }
}
