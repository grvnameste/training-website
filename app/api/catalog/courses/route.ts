import { NextResponse } from 'next/server'
import { toErrorResponse } from '@/lib/http/errors'
import { listPublishedCourses } from '@/lib/services/enrollment-service'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const courses = await listPublishedCourses({
      search: searchParams.get('q') ?? undefined,
      level: searchParams.get('level') ?? undefined,
      topic: searchParams.get('topic') ?? undefined,
      price: searchParams.get('price') ?? undefined,
      limit: Number(searchParams.get('limit') ?? 60),
    })
    return NextResponse.json({ courses, total: courses.length })
  } catch (error) {
    return toErrorResponse(error)
  }
}
