import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { upsertRubric } from '@/lib/services/assignment-service'

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  criteria: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).nullable().optional(),
        maxPoints: z.number().int().min(1).max(1000),
      })
    )
    .min(1)
    .max(30),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { assignmentId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid rubric', parsed.error.flatten())

    const rubric = await upsertRubric(
      authResult.context,
      assignmentId,
      parsed.data
    )
    return NextResponse.json({ success: true, rubric })
  } catch (error) {
    return toErrorResponse(error)
  }
}
