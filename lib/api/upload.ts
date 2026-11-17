export interface SignedUploadInput {
  purpose:
    | 'course-thumbnail'
    | 'lesson-video'
    | 'lesson-resource'
    | 'lesson-image'
    | 'submission-file'
    | 'project-milestone-file'
  courseId: string
  lessonId?: string
  assignmentId?: string
  instanceMilestoneId?: string
}

export async function uploadWithSignedUrl(file: File, input: SignedUploadInput) {
  const signRes = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, fileName: file.name }),
  })
  const signed = await signRes.json().catch(() => ({}))
  if (!signRes.ok) throw new Error(signed?.error || 'Could not prepare upload')

  const uploadRes = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file,
  })

  if (!uploadRes.ok) throw new Error('Upload failed')

  return {
    bucket: signed.bucket as string,
    path: signed.path as string,
    publicUrl: (signed.publicUrl as string | null) ?? null,
    storagePath: signed.path as string,
  }
}
