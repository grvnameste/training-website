import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { toErrorResponse } from '@/lib/http/errors'
import { publishTemplate } from '@/lib/services/project-service'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { templateId } = await params
    const template = await publishTemplate(authResult.context, templateId)
    return NextResponse.json({ template })
  } catch (error) {
    return toErrorResponse(error)
  }
}
