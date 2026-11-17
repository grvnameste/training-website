'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FolderKanban, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type ProjectSubmission = {
  submissionId: string
  instanceId: string
  instanceMilestoneId: string
  templateTitle: string
  courseTitle: string
  milestoneTitle: string
  studentName: string
  studentEmail: string | null
  attempt: number
  submittedAt: string
  content: string | null
  repoUrl: string | null
  linkUrl: string | null
}

export default function ProjectReviewsPage() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [acting, setActing] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/instructor/project-reviews', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load project reviews')
      setSubmissions(data.submissions ?? [])
    } catch (error: any) {
      toast.error(error?.message || 'Could not load project reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const decide = async (
    submissionId: string,
    decision: 'approved' | 'changes_requested'
  ) => {
    setActing(submissionId)
    try {
      const res = await fetch(`/api/instructor/project-submissions/${submissionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          feedback: feedback[submissionId]?.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save review')
      toast.success(decision === 'approved' ? 'Milestone approved' : 'Changes requested')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not save review')
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Project queue
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Milestone reviews
        </h1>
        <p className="text-sm text-slate-500">
          Review submitted project milestones and unlock the next phase.
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No project milestones awaiting review.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.submissionId} className="rounded-2xl border border-slate-200 bg-white">
              <CardContent className="space-y-3 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {submission.courseTitle} · {submission.templateTitle}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {submission.milestoneTitle}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {submission.studentName}
                    {submission.studentEmail ? ` (${submission.studentEmail})` : ''} · Attempt{' '}
                    {submission.attempt} · {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>

                {submission.content && (
                  <p className="whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
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

                <Input
                  value={feedback[submission.submissionId] ?? ''}
                  onChange={(event) =>
                    setFeedback((prev) => ({
                      ...prev,
                      [submission.submissionId]: event.target.value,
                    }))
                  }
                  placeholder="Feedback for the student"
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => decide(submission.submissionId, 'approved')}
                    disabled={acting === submission.submissionId}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Approve milestone
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => decide(submission.submissionId, 'changes_requested')}
                    disabled={acting === submission.submissionId}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    Request changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
