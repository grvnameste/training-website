import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  deleteMilestone,
  updateMilestone,
} from '@/lib/services/project-service'

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  acceptanceCriteria: z.string().max(5000).nullable().optional(),
  estimatedHours: z.number().int().positive().nullable().optional(),
  dueOffsetDays: z.number().int().min(0).max(3650).nullable().optional(),
  isRequired: z.boolean().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { milestoneId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid milestone', parsed.error.flatten())
    const milestone = await updateMilestone(
      authResult.context,
      milestoneId,
      parsed.data
    )
    return NextResponse.json({ milestone })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { milestoneId } = await params
    await deleteMilestone(authResult.context, milestoneId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
