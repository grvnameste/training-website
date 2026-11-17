import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, requireRole } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, toErrorResponse } from '@/lib/http/errors'
import { assertCourseManage, getCourseById } from '@/lib/services/course-access-service'
import { getLessonCourseId } from '@/lib/services/progress-service'
import { assertStudentAssignmentAccess } from '@/lib/services/assignment-service'
import { assertMilestoneUploadAccess } from '@/lib/services/project-service'
import {
  STORAGE_BUCKETS,
  createSignedUploadUrl,
  getPublicUrl,
} from '@/lib/storage/signed-urls'

const schema = z.object({
  purpose: z.enum([
    'course-thumbnail',
    'lesson-video',
    'lesson-resource',
    'lesson-image',
    'submission-file',
    'project-milestone-file',
  ]),
  courseId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  assignmentId: z.string().uuid().optional(),
  instanceMilestoneId: z.string().uuid().optional(),
  fileName: z.string().min(1).max(255),
})

const PURPOSE_CONFIG = {
  'course-thumbnail': {
    bucket: STORAGE_BUCKETS.courseThumbnails,
    prefix: 'thumbnails',
    public: true,
    lessonScoped: false,
  },
  'lesson-video': {
    bucket: STORAGE_BUCKETS.lessonVideos,
    prefix: 'videos',
    public: true,
    lessonScoped: true,
  },
  'lesson-resource': {
    bucket: STORAGE_BUCKETS.lessonResources,
    prefix: 'resources',
    public: false,
    lessonScoped: true,
  },
  'lesson-image': {
    bucket: STORAGE_BUCKETS.courseThumbnails,
    prefix: 'lesson-images',
    public: true,
    lessonScoped: true,
  },
  'submission-file': {
    bucket: STORAGE_BUCKETS.submissionFiles,
    prefix: 'submissions',
    public: false,
    lessonScoped: false,
  },
  'project-milestone-file': {
    bucket: STORAGE_BUCKETS.submissionFiles,
    prefix: 'projects',
    public: false,
    lessonScoped: false,
  },
} as const

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = schema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid upload request', parsed.error.flatten())

    const {
      purpose,
      courseId,
      lessonId,
      assignmentId,
      instanceMilestoneId,
      fileName,
    } = parsed.data
    const safeName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')

    if (purpose === 'project-milestone-file') {
      if (!instanceMilestoneId) {
        throw badRequest('instanceMilestoneId is required for project uploads')
      }
      const { instance, instanceMilestone } = await assertMilestoneUploadAccess(
        authResult.context,
        instanceMilestoneId
      )
      if (instance.courseId !== courseId) {
        throw badRequest('Project does not belong to this course')
      }
      const course = await getCourseById(courseId)
      const config = PURPOSE_CONFIG[purpose]
      const path = [
        config.prefix,
        course?.companyId ?? 'platform',
        courseId,
        instance.id,
        instanceMilestone.id,
        authResult.context.profile.id,
        `${Date.now()}-${crypto.randomUUID()}-${safeName}`,
      ].join('/')

      const signed = await createSignedUploadUrl(config.bucket, path)
      return NextResponse.json({
        bucket: config.bucket,
        path,
        uploadUrl: signed.signedUrl,
        token: signed.token,
        publicUrl: null,
      })
    }

    if (purpose === 'submission-file') {
      if (!assignmentId) throw badRequest('assignmentId is required for submission uploads')
      const assignment = await assertStudentAssignmentAccess(
        authResult.context,
        assignmentId
      )
      if (assignment.courseId !== courseId) {
        throw badRequest('Assignment does not belong to this course')
      }
      const course = await getCourseById(courseId)
      const config = PURPOSE_CONFIG[purpose]
      const path = [
        config.prefix,
        course?.companyId ?? 'platform',
        courseId,
        assignmentId,
        authResult.context.profile.id,
        `${Date.now()}-${crypto.randomUUID()}-${safeName}`,
      ].join('/')

      const signed = await createSignedUploadUrl(config.bucket, path)
      return NextResponse.json({
        bucket: config.bucket,
        path,
        uploadUrl: signed.signedUrl,
        token: signed.token,
        publicUrl: null,
      })
    }

    const instructorResult = await requireRole(['teacher', 'super_admin'])
    if (!instructorResult.success) return instructorResult.response

    const course = await assertCourseManage(instructorResult.context, courseId)
    const config = PURPOSE_CONFIG[purpose]

    if (config.lessonScoped) {
      if (!lessonId) throw badRequest('lessonId is required for this upload')
      const lessonCourseId = await getLessonCourseId(lessonId)
      if (lessonCourseId !== courseId) {
        throw badRequest('Lesson does not belong to this course')
      }
    }

    const path = [
      config.prefix,
      course.companyId ?? 'platform',
      courseId,
      lessonId ?? 'course',
      `${Date.now()}-${crypto.randomUUID()}-${safeName}`,
    ].join('/')

    const signed = await createSignedUploadUrl(config.bucket, path)
    return NextResponse.json({
      bucket: config.bucket,
      path,
      uploadUrl: signed.signedUrl,
      token: signed.token,
      publicUrl: config.public ? getPublicUrl(config.bucket, path) : null,
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
