import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const STORAGE_BUCKETS = {
  lessonVideos: 'lesson-videos',
  lessonResources: 'lesson-resources',
  courseThumbnails: 'course-thumbnails',
  chatMedia: 'chat-media',
  requirementDocuments: 'requirement-documents',
  stage3Deliverables: 'stage3-deliverables',
  submissionFiles: 'submission-files',
} as const

export async function createSignedUploadUrl(bucket: string, path: string) {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(path)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Could not create an upload URL')
  }
  return data
}

export function getPublicUrl(bucket: string, path: string) {
  const admin = getSupabaseAdmin()
  return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function createSignedDownloadUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 300
) {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Could not create a download URL')
  }
  return data.signedUrl
}
