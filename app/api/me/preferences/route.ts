import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import {
  getPreferences,
  upsertPreferences,
} from '@/lib/services/onboarding-service'

const schema = z.object({
  goal: z.string().max(500).nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).nullable().optional(),
  weeklyMinutes: z.number().int().min(30).max(3000).nullable().optional(),
  preferredTopics: z.array(z.string().min(1).max(60)).max(20).optional(),
})

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const preferences = await getPreferences(authResult.context.profile.id)
    return NextResponse.json({ preferences })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PUT(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid preferences', parsed.error.flatten())
    }

    const preferences = await upsertPreferences(
      authResult.context.profile.id,
      parsed.data
    )
    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    return toErrorResponse(error)
  }
}
