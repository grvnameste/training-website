import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { addPhase } from '@/lib/services/project-service'

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { templateId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid phase', parsed.error.flatten())
    const phase = await addPhase(authResult.context, templateId, parsed.data)
    return NextResponse.json({ phase }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
