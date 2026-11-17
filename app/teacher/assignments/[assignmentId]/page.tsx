'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Download, Loader2, Plus, Save, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Criterion = {
  id: string
  title: string
  description: string | null
  maxPoints: number
  position: number
}

type SubmissionFile = {
  id: string
  fileName: string
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
  studentId: string
  studentName: string
  studentEmail: string | null
  attempt: number
  status: string
  content: string | null
  repoUrl: string | null
  linkUrl: string | null
  submittedAt: string
  files: SubmissionFile[]
  review: Review | null
}

type Detail = {
  assignment: {
    id: string
    courseId: string
    title: string
    instructions: string
    dueAt: string | null
    status: string
    maxAttempts: number
  }
  rubric: { id: string; title: string; criteria: Criterion[] } | null
  submissions: Submission[]
}

type RubricDraft = {
  title: string
  criteria: { title: string; description: string; maxPoints: string }[]
}

export default function InstructorAssignmentDetailPage() {
  const params = useParams()
  const assignmentId = params.assignmentId as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingRubric, setSavingRubric] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [rubricDraft, setRubricDraft] = useState<RubricDraft>({
    title: 'Evaluation rubric',
    criteria: [{ title: '', description: '', maxPoints: '10' }],
  })
  const [reviewDrafts, setReviewDrafts] = useState<
    Record<
      string,
      { decision: 'approved' | 'changes_requested' | 'graded'; feedback: string; scores: Record<string, string> }
    >
  >({})

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/instructor/assignments/${assignmentId}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load assignment')
      setDetail(data)
      if (data.rubric?.criteria?.length) {
        setRubricDraft({
          title: data.rubric.title,
          criteria: data.rubric.criteria.map((criterion: Criterion) => ({
            title: criterion.title,
            description: criterion.description ?? '',
            maxPoints: String(criterion.maxPoints),
          })),
        })
      }
      const drafts: Record<string, any> = {}
      for (const submission of data.submissions ?? []) {
        const scores: Record<string, string> = {}
        for (const criterion of data.rubric?.criteria ?? []) {
          const existing = submission.review?.scores?.find(
            (score: any) => score.criterionId === criterion.id
          )
          scores[criterion.id] = existing ? String(existing.points) : ''
        }
        drafts[submission.id] = {
          decision: submission.review?.decision ?? 'graded',
          feedback: submission.review?.overallFeedback ?? '',
          scores,
        }
      }
      setReviewDrafts(drafts)
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

  const criteria = useMemo(() => detail?.rubric?.criteria ?? [], [detail])

  const updateCriterion = (index: number, key: string, value: string) => {
    setRubricDraft((prev) => ({
      ...prev,
      criteria: prev.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, [key]: value } : criterion
      ),
    }))
  }

  const saveRubric = async () => {
    const payload = {
      title: rubricDraft.title,
      criteria: rubricDraft.criteria
        .filter((criterion) => criterion.title.trim())
        .map((criterion) => ({
          title: criterion.title.trim(),
          description: criterion.description.trim() || null,
          maxPoints: Number(criterion.maxPoints || 0),
        })),
    }
    if (payload.criteria.length === 0) {
      toast.error('Add at least one criterion')
      return
    }
    if (payload.criteria.some((criterion) => criterion.maxPoints <= 0)) {
      toast.error('Each criterion needs a positive point value')
      return
    }

    setSavingRubric(true)
    try {
      const res = await fetch(`/api/instructor/assignments/${assignmentId}/rubric`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save rubric')
      toast.success('Rubric saved')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not save rubric')
    } finally {
      setSavingRubric(false)
    }
  }

  const publish = async () => {
    setPublishing(true)
    try {
      const res = await fetch(`/api/instructor/assignments/${assignmentId}/publish`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not publish assignment')
      toast.success('Assignment published')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not publish assignment')
    } finally {
      setPublishing(false)
    }
  }

  const updateReviewDraft = (
    submissionId: string,
    key: string,
    value: string,
    criterionId?: string
  ) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] ?? { decision: 'graded', feedback: '', scores: {} }),
        ...(criterionId
          ? {
              scores: {
                ...(prev[submissionId]?.scores ?? {}),
                [criterionId]: value,
              },
            }
          : { [key]: value }),
      },
    }))
  }

  const submitReview = async (submission: Submission) => {
    const draft = reviewDrafts[submission.id]
    if (!draft) return
    if (!detail?.rubric) {
      toast.error('Save a rubric before reviewing')
      return
    }

    const scores = criteria.map((criterion) => ({
      criterionId: criterion.id,
      points: Number(draft.scores[criterion.id] || 0),
      comment: null,
    }))

    if (scores.some((score, index) => score.points < 0 || score.points > criteria[index].maxPoints)) {
      toast.error('Scores must be within each criterion maximum')
      return
    }

    try {
      const res = await fetch(`/api/instructor/submissions/${submission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: draft.decision,
          overallFeedback: draft.feedback.trim() || null,
          scores,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save review')
      toast.success('Review saved')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not save review')
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
        <Link href="/teacher/courses">
          <Button className="mt-4" variant="outline">Back to courses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={`/teacher/courses/${detail.assignment.courseId}/assignments`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to assignments
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {detail.assignment.title}
          </h1>
          <p className="text-sm text-slate-500">
            {detail.assignment.dueAt
              ? `Due ${new Date(detail.assignment.dueAt).toLocaleString()}`
              : 'No deadline'}{' '}
            · {detail.assignment.maxAttempts} attempt(s) · {detail.assignment.status}
          </p>
        </div>
        {detail.assignment.status !== 'published' && (
          <Button onClick={publish} disabled={publishing} className="bg-blue-600 text-white hover:bg-blue-700">
            {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Publish assignment
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Instructions</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {detail.assignment.instructions}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Rubric</CardTitle>
          <Button size="sm" onClick={saveRubric} disabled={savingRubric}>
            {savingRubric ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save rubric
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={rubricDraft.title}
            onChange={(event) => setRubricDraft({ ...rubricDraft, title: event.target.value })}
            placeholder="Rubric title"
          />
          {rubricDraft.criteria.map((criterion, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[2fr_1fr_80px_auto]">
              <Input
                value={criterion.title}
                onChange={(event) => updateCriterion(index, 'title', event.target.value)}
                placeholder="Criterion"
              />
              <Input
                value={criterion.description}
                onChange={(event) => updateCriterion(index, 'description', event.target.value)}
                placeholder="Description (optional)"
              />
              <Input
                type="number"
                min={1}
                value={criterion.maxPoints}
                onChange={(event) => updateCriterion(index, 'maxPoints', event.target.value)}
                placeholder="Points"
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remove criterion"
                className="text-red-600"
                onClick={() =>
                  setRubricDraft((prev) => ({
                    ...prev,
                    criteria: prev.criteria.filter((_, i) => i !== index),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setRubricDraft((prev) => ({
                ...prev,
                criteria: [...prev.criteria, { title: '', description: '', maxPoints: '10' }],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add criterion
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Submissions ({detail.submissions.length})
        </h2>
        {detail.submissions.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          detail.submissions.map((submission) => {
            const draft = reviewDrafts[submission.id] ?? {
              decision: 'graded',
              feedback: '',
              scores: {},
            }
            return (
              <Card key={submission.id} className="rounded-2xl border border-slate-200 bg-white">
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{submission.studentName}</p>
                      <p className="text-xs text-slate-500">
                        {submission.studentEmail} · Attempt {submission.attempt} ·{' '}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                      {submission.status.replace('_', ' ')}
                    </span>
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
                  {submission.files.map((file) => (
                    <a
                      key={file.id}
                      href={`/api/submission-files/${file.id}/download`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Download className="h-4 w-4" /> {file.fileName}
                    </a>
                  ))}

                  {submission.review && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                      <p className="font-semibold capitalize">
                        {submission.review.decision.replace('_', ' ')}
                        {submission.review.totalScore !== null
                          ? ` · ${submission.review.totalScore} points`
                          : ''}
                      </p>
                      {submission.review.overallFeedback && (
                        <p className="mt-1 whitespace-pre-line">{submission.review.overallFeedback}</p>
                      )}
                    </div>
                  )}

                  {detail.rubric && criteria.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Review with rubric
                      </p>
                      {criteria.map((criterion) => (
                        <div key={criterion.id} className="flex items-center gap-2">
                          <span className="flex-1 text-sm text-slate-700">
                            {criterion.title}{' '}
                            <span className="text-xs text-slate-400">/ {criterion.maxPoints}</span>
                          </span>
                          <Input
                            type="number"
                            min={0}
                            max={criterion.maxPoints}
                            value={draft.scores[criterion.id] ?? ''}
                            onChange={(event) =>
                              updateReviewDraft(
                                submission.id,
                                'score',
                                event.target.value,
                                criterion.id
                              )
                            }
                            className="w-20"
                          />
                        </div>
                      ))}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          value={draft.decision}
                          onChange={(event) =>
                            updateReviewDraft(submission.id, 'decision', event.target.value)
                          }
                          className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm"
                        >
                          <option value="graded">Graded</option>
                          <option value="approved">Approved</option>
                          <option value="changes_requested">Changes requested</option>
                        </select>
                        <Button onClick={() => submitReview(submission)} className="bg-blue-600 text-white hover:bg-blue-700">
                          Save review
                        </Button>
                      </div>
                      <textarea
                        rows={3}
                        value={draft.feedback}
                        onChange={(event) =>
                          updateReviewDraft(submission.id, 'feedback', event.target.value)
                        }
                        placeholder="Overall feedback"
                        className="w-full rounded-md border border-slate-200 p-3 text-sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
