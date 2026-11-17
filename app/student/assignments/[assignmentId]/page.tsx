'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle2, Download, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { uploadWithSignedUrl } from '@/lib/api/upload'

type Criterion = {
  id: string
  title: string
  description: string | null
  maxPoints: number
}

type FileRow = {
  id: string
  fileName: string
  mimeType: string | null
  sizeBytes: number | null
}

type Review = {
  id: string
  decision: string
  overallFeedback: string | null
  totalScore: number | null
  createdAt: string
  scores: { criterionId: string; points: number; comment: string | null }[]
}

type Submission = {
  id: string
  attempt: number
  status: string
  content: string | null
  repoUrl: string | null
  linkUrl: string | null
  submittedAt: string
  files: FileRow[]
  review: Review | null
}

type Detail = {
  assignment: {
    id: string
    courseId: string
    title: string
    instructions: string
    dueAt: string | null
    submissionTypes: string[]
    maxAttempts: number
    isRequired: boolean
  }
  course: { id: string; title: string } | null
  rubric: { id: string; title: string; criteria: Criterion[] } | null
  submissions: Submission[]
  canSubmit: boolean
}

export default function StudentAssignmentPage() {
  const params = useParams()
  const assignmentId = params.assignmentId as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [files, setFiles] = useState<
    { storagePath: string; fileName: string; mimeType?: string; sizeBytes?: number }[]
  >([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/me/assignments/${assignmentId}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load assignment')
      setDetail(data)
    } catch (error: any) {
      toast.error(error?.message || 'Could not load assignment')
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  const criteriaById = useMemo(() => {
    const map = new Map<string, Criterion>()
    for (const criterion of detail?.rubric?.criteria ?? []) {
      map.set(criterion.id, criterion)
    }
    return map
  }, [detail])

  const uploadFile = async (file: File) => {
    if (!detail) return
    try {
      toast.loading(`Uploading ${file.name}…`, { id: `upload-${file.name}` })
      const uploaded = await uploadWithSignedUrl(file, {
        purpose: 'submission-file',
        courseId: detail.assignment.courseId,
        assignmentId,
      })
      setFiles((prev) => [
        ...prev,
        {
          storagePath: uploaded.storagePath,
          fileName: file.name,
          mimeType: file.type || undefined,
          sizeBytes: file.size,
        },
      ])
      toast.success(`${file.name} ready`, { id: `upload-${file.name}` })
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed', { id: `upload-${file.name}` })
    }
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/me/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim() || null,
          repoUrl: repoUrl.trim() || null,
          linkUrl: linkUrl.trim() || null,
          files,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not submit assignment')
      toast.success('Assignment submitted')
      setContent('')
      setRepoUrl('')
      setLinkUrl('')
      setFiles([])
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-slate-500">Assignment not found.</p>
        <Link href="/student/assignments">
          <Button className="mt-4" variant="outline">Back to assignments</Button>
        </Link>
      </div>
    )
  }

  const { assignment, rubric, submissions, canSubmit } = detail
  const latest = submissions[0] ?? null

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div>
        <Link
          href="/student/assignments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to assignments
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {detail.course?.title}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          {assignment.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {assignment.dueAt
            ? `Due ${new Date(assignment.dueAt).toLocaleString()}`
            : 'No deadline'}{' '}
          · {assignment.maxAttempts} attempt{assignment.maxAttempts === 1 ? '' : 's'}
          {assignment.isRequired ? ' · required' : ''}
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Instructions</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {assignment.instructions}
          </p>
          {rubric && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {rubric.title}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {rubric.criteria.map((criterion) => (
                  <div key={criterion.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{criterion.title}</p>
                      <span className="text-xs font-semibold text-slate-500">
                        {criterion.maxPoints} pts
                      </span>
                    </div>
                    {criterion.description && (
                      <p className="mt-1 text-xs text-slate-500">{criterion.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {latest?.review && (
        <Card className="rounded-2xl border border-blue-200 bg-blue-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-blue-950">
              <CheckCircle2 className="h-4 w-4" /> Latest review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium capitalize text-blue-900">
              {latest.review.decision.replace('_', ' ')}
              {latest.review.totalScore !== null
                ? ` · ${latest.review.totalScore} points`
                : ''}
            </p>
            {latest.review.overallFeedback && (
              <p className="whitespace-pre-line text-sm text-blue-950">
                {latest.review.overallFeedback}
              </p>
            )}
            <div className="space-y-1">
              {latest.review.scores.map((score) => (
                <p key={score.criterionId} className="text-xs text-blue-900">
                  {criteriaById.get(score.criterionId)?.title ?? 'Criterion'}:{' '}
                  {score.points}/{criteriaById.get(score.criterionId)?.maxPoints ?? '—'}
                  {score.comment ? ` — ${score.comment}` : ''}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {canSubmit ? (
        <Card className="rounded-2xl border border-slate-200 bg-white">
          <CardHeader><CardTitle className="text-base">Submit your work</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <textarea
              rows={6}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your response or notes for the reviewer…"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="Repository URL (optional)"
              />
              <Input
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="Deliverable link (optional)"
              />
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Upload className="h-4 w-4" /> Files
              </p>
              <Input
                type="file"
                multiple
                onChange={(event) => {
                  for (const file of Array.from(event.target.files ?? [])) {
                    void uploadFile(file)
                  }
                  event.target.value = ''
                }}
              />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {files.map((file) => (
                    <li key={file.storagePath}>{file.fileName}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={submit}
                disabled={submitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">
            {latest?.status === 'approved' || latest?.status === 'graded'
              ? 'This assignment has been accepted. No further submissions are needed.'
              : 'You have used all available attempts. Contact your instructor if you need another review.'}
          </p>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Submission history</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id} className="rounded-2xl border border-slate-200 bg-white">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Attempt {submission.attempt}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                    {submission.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Submitted {new Date(submission.submittedAt).toLocaleString()}
                </p>
                {submission.content && (
                  <p className="whitespace-pre-line text-sm text-slate-700">
                    {submission.content}
                  </p>
                )}
                {submission.repoUrl && (
                  <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline">
                    Repository
                  </a>
                )}
                {submission.linkUrl && (
                  <a href={submission.linkUrl} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline">
                    Deliverable link
                  </a>
                )}
                {submission.files.length > 0 && (
                  <div className="space-y-1">
                    {submission.files.map((file) => (
                      <a
                        key={file.id}
                        href={`/api/submission-files/${file.id}/download`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <Download className="h-4 w-4" /> {file.fileName}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
