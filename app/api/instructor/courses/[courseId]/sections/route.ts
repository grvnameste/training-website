import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { addSection } from '@/lib/services/authoring-service'

const schema = z.object({ title: z.string().min(1).max(200) })

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const { courseId } = await params
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid section', parsed.error.flatten())

    const section = await addSection(authResult.context, courseId, parsed.data.title)
    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
