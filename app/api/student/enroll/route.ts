import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { enrollInFreeCourse } from '@/lib/services/enrollment-service'

const enrollSchema = z.object({
  courseId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = enrollSchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid enrollment request', parsed.error.flatten())
    }

    const result = await enrollInFreeCourse(authResult.context, parsed.data.courseId)
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
