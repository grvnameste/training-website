import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  deleteAssignment,
  getAssignmentForManagement,
  updateAssignment,
} from '@/lib/services/assignment-service'

const submissionType = z.enum(['text', 'file', 'link', 'repo'])

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  instructions: z.string().min(1).max(20_000).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  submissionTypes: z.array(submissionType).min(1).max(4).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  isRequired: z.boolean().optional(),
  lessonId: z.string().uuid().nullable().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { assignmentId } = await params
    const data = await getAssignmentForManagement(
      authResult.context,
      assignmentId
    )
    return NextResponse.json(data)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { assignmentId } = await params
    const parsed = updateSchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid assignment', parsed.error.flatten())

    const assignment = await updateAssignment(
      authResult.context,
      assignmentId,
      parsed.data
    )
    return NextResponse.json({ assignment })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response
    const { assignmentId } = await params
    await deleteAssignment(authResult.context, assignmentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
