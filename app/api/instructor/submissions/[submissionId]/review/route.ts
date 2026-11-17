import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { reviewSubmission } from '@/lib/services/assignment-service'

const schema = z.object({
  decision: z.enum(['approved', 'changes_requested', 'graded']),
  overallFeedback: z.string().max(10_000).nullable().optional(),
  scores: z
    .array(
      z.object({
        criterionId: z.string().uuid(),
        points: z.number().int().min(0).max(1000),
        comment: z.string().max(2000).nullable().optional(),
      })
    )
    .min(1)
    .max(30),
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

    const result = await reviewSubmission(
      authResult.context,
      submissionId,
      parsed.data
    )
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return toErrorResponse(error)
  }
}
