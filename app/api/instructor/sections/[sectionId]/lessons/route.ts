import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { addLesson } from '@/lib/services/authoring-service'

const schema = z.object({
  title: z.string().min(1).max(200),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { sectionId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid lesson', parsed.error.flatten())

    const lesson = await addLesson(authResult.context, sectionId, parsed.data)
    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
