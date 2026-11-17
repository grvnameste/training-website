import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  assertTemplateManage,
  deleteTemplate,
  getTemplateTree,
  updateTemplate,
} from '@/lib/services/project-service'

const schema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { templateId } = await params
    const template = await assertTemplateManage(authResult.context, templateId)
    const phases = await getTemplateTree(templateId)
    return NextResponse.json({ template, phases })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { templateId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid project template', parsed.error.flatten())
    const template = await updateTemplate(authResult.context, templateId, parsed.data)
    return NextResponse.json({ template })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { templateId } = await params
    await deleteTemplate(authResult.context, templateId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
