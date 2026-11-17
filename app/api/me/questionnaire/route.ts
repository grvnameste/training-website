import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { questionnaireResults, studentActivity } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { assertSameOrigin, parseJson } from '@/lib/http/request'

const bodySchema = z.object({
  careerAnswers: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
  careerOpenAnswers: z.record(z.string(), z.string()).default({}),
  cultureAnswers: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
})

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const [result] = await db
      .select()
      .from(questionnaireResults)
      .where(eq(questionnaireResults.userId, authResult.context.profile.id))
      .orderBy(desc(questionnaireResults.createdAt))
      .limit(1)

    return NextResponse.json({ result: result ?? null })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid questionnaire response', parsed.error.flatten())
    }

    const [result] = await db
      .insert(questionnaireResults)
      .values({
        userId: authResult.context.profile.id,
        careerAnswers: parsed.data.careerAnswers,
        careerOpenAnswers: parsed.data.careerOpenAnswers,
        cultureAnswers: parsed.data.cultureAnswers,
      })
      .returning()

    await db.insert(studentActivity).values({
      studentId: authResult.context.profile.id,
      type: 'QUESTIONNAIRE_COMPLETED',
    })

    return NextResponse.json({ success: true, result }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
