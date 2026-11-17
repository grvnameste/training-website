import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  createTemplate,
  listInstructorTemplates,
} from '@/lib/services/project-service'

const schema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).nullable().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { courseId } = await params
    const templates = await listInstructorTemplates(authResult.context, courseId)
    return NextResponse.json({ templates })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { courseId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid project template', parsed.error.flatten())
    const template = await createTemplate(authResult.context, courseId, parsed.data)
    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
