'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardCheck, Loader2 } from 'lucide-react'

type ReviewRow = {
  submissionId: string
  assignmentId: string
  assignmentTitle: string
  courseTitle: string
  studentName: string
  studentEmail: string | null
  attempt: number
  status: string
  submittedAt: string
  repoUrl: string | null
  linkUrl: string | null
}

export default function InstructorReviewsPage() {
  const [submissions, setSubmissions] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/instructor/reviews', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok && active) setSubmissions(data.submissions ?? [])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

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
          Review queue
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Assignment reviews
        </h1>
        <p className="text-sm text-slate-500">
          Submissions waiting for rubric-based feedback and decisions.
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No submissions awaiting review.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card key={submission.submissionId} className="rounded-2xl border border-slate-200 bg-white">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{submission.assignmentTitle}</h2>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-amber-700">
                      {submission.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {submission.courseTitle} · {submission.studentName}
                    {submission.studentEmail ? ` (${submission.studentEmail})` : ''} · Attempt{' '}
                    {submission.attempt} · {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <Link href={`/teacher/assignments/${submission.assignmentId}`}>
                  <Button variant="outline">Review</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
