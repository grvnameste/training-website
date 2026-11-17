import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lessonResources } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { notFound, toErrorResponse } from '@/lib/http/errors'
import { assertCourseLearn, getCourseById } from '@/lib/services/course-access-service'
import { getLessonCourseId } from '@/lib/services/progress-service'
import { STORAGE_BUCKETS, createSignedDownloadUrl } from '@/lib/storage/signed-urls'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { resourceId } = await params
    const [resource] = await db
      .select()
      .from(lessonResources)
      .where(eq(lessonResources.id, resourceId))
      .limit(1)

    if (!resource) throw notFound('Resource not found')

    const courseId = await getLessonCourseId(resource.lessonId)
    if (!courseId) throw notFound('Resource not found')
    const course = await getCourseById(courseId)
    if (!course) throw notFound('Resource not found')
    await assertCourseLearn(authResult.context, course)

    if (resource.kind === 'link' && resource.externalUrl) {
      return NextResponse.redirect(resource.externalUrl)
    }

    if (!resource.storagePath) throw notFound('Resource file not found')

    const signedUrl = await createSignedDownloadUrl(
      STORAGE_BUCKETS.lessonResources,
      resource.storagePath,
      300
    )
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    return toErrorResponse(error)
  }
}
