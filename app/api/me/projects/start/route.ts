import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { startProject } from '@/lib/services/project-service'

const schema = z.object({ templateId: z.string().uuid() })

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response
    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid project', parsed.error.flatten())
    const instance = await startProject(authResult.context, parsed.data.templateId)
    return NextResponse.json({ instance }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
