import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { submitAssignment } from '@/lib/services/assignment-service'

const schema = z.object({
  content: z.string().max(50_000).nullable().optional(),
  repoUrl: z.string().url().max(2000).nullable().optional(),
  linkUrl: z.string().url().max(2000).nullable().optional(),
  files: z
    .array(
      z.object({
        storagePath: z.string().min(1).max(1000),
        fileName: z.string().min(1).max(255),
        mimeType: z.string().max(200).optional(),
        sizeBytes: z.number().int().positive().optional(),
      })
    )
    .max(10)
    .optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { assignmentId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid submission', parsed.error.flatten())

    const submission = await submitAssignment(
      authResult.context,
      assignmentId,
      parsed.data
    )
    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
