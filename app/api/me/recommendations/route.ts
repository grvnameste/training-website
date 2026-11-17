import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import { getRecommendations } from '@/lib/services/onboarding-service'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const data = await getRecommendations(authResult.context)
    return NextResponse.json(data)
  } catch (error) {
    return toErrorResponse(error)
  }
}
