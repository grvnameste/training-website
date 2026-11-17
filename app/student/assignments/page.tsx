'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Loader2 } from 'lucide-react'

type Assignment = {
  id: string
  courseTitle: string
  title: string
  dueAt: string | null
  isRequired: boolean
  isOverdue: boolean
  canSubmit: boolean
  maxAttempts: number
  latestSubmission: {
    attempt: number
    status: string
    submittedAt: string
  } | null
}

export default function StudentAssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/me/assignments', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok && active) setAssignments(data.assignments ?? [])
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
          Coursework
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Assignments
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Submit work, track reviews, and respond to feedback.
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            No published assignments yet. They will appear here when an instructor assigns one.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
            const status = assignment.latestSubmission?.status
            return (
              <Card key={assignment.id} className="rounded-2xl border border-slate-200 bg-white">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {assignment.courseTitle}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        {assignment.title}
                      </h2>
                    </div>
                    {assignment.isOverdue ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                        Overdue
                      </span>
                    ) : status ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-blue-700">
                        {status.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        Not submitted
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    {assignment.dueAt
                      ? `Due ${new Date(assignment.dueAt).toLocaleString()}`
                      : 'No deadline'}
                    {assignment.latestSubmission
                      ? ` · Attempt ${assignment.latestSubmission.attempt}/${assignment.maxAttempts}`
                      : ''}
                  </p>

                  <Button
                    className="w-full rounded-xl bg-slate-900 text-white hover:bg-blue-600"
                    onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                  >
                    {status ? 'View submission and feedback' : 'Open assignment'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
