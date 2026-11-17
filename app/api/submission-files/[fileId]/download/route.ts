import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  assignmentSubmissions,
  assignments,
  submissionFiles,
} from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { forbidden, notFound, toErrorResponse } from '@/lib/http/errors'
import {
  canManageCourse,
  getCourseById,
} from '@/lib/services/course-access-service'
import {
  STORAGE_BUCKETS,
  createSignedDownloadUrl,
} from '@/lib/storage/signed-urls'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { fileId } = await params
    const [file] = await db
      .select()
      .from(submissionFiles)
      .where(eq(submissionFiles.id, fileId))
      .limit(1)
    if (!file) throw notFound('File not found')

    const [submission] = await db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, file.submissionId))
      .limit(1)
    if (!submission) throw notFound('File not found')

    const [assignment] = await db
      .select({ id: assignments.id, courseId: assignments.courseId })
      .from(assignments)
      .where(eq(assignments.id, submission.assignmentId))
      .limit(1)
    if (!assignment) throw notFound('File not found')

    const course = await getCourseById(assignment.courseId)
    if (!course) throw notFound('File not found')

    const isOwner = submission.studentId === authResult.context.profile.id
    const isReviewer = canManageCourse(authResult.context, course)
    if (!isOwner && !isReviewer) throw forbidden('You do not have access to this file')

    const signedUrl = await createSignedDownloadUrl(
      STORAGE_BUCKETS.submissionFiles,
      file.storagePath,
      300
    )
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    return toErrorResponse(error)
  }
}
