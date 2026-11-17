import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { reviewMilestone } from '@/lib/services/project-service'

const schema = z.object({
  decision: z.enum(['approved', 'changes_requested']),
  feedback: z.string().max(10_000).nullable().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { submissionId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid review', parsed.error.flatten())
    const result = await reviewMilestone(
      authResult.context,
      submissionId,
      parsed.data
    )
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
