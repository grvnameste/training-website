import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  createAssignment,
  listInstructorAssignments,
} from '@/lib/services/assignment-service'

const submissionType = z.enum(['text', 'file', 'link', 'repo'])

const createSchema = z.object({
  title: z.string().min(2).max(200),
  instructions: z.string().min(1).max(20_000),
  dueAt: z.string().datetime().nullable().optional(),
  submissionTypes: z.array(submissionType).min(1).max(4).default(['text']),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  isRequired: z.boolean().optional(),
  lessonId: z.string().uuid().nullable().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { courseId } = await params
    const assignments = await listInstructorAssignments(
      authResult.context,
      courseId
    )
    return NextResponse.json({ assignments })
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
    const parsed = createSchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid assignment', parsed.error.flatten())

    const assignment = await createAssignment(
      authResult.context,
      courseId,
      parsed.data
    )
    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
