'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type CertificateBlocker = {
  type: 'assignment' | 'project_milestone'
  id: string
  title: string
  status: string | null
  dueAt: string | null
}

type Readiness = {
  readyToIssue: boolean
  requirementsMet: boolean
  certificateEnabled: boolean
  capstoneCompleted: boolean
  assignments: { required: number; approved: number }
  milestones: { required: number; approved: number }
  blockers: CertificateBlocker[]
}

type PendingCertRow = {
  student_id: string
  capstone_id: string
  stage3_submitted: boolean
  certificate_requested: boolean
  completed: boolean
  certificate_issued: boolean
  student_name?: string
  capstone_title?: string
  readiness?: Readiness | null
}

export default function TeacherCertificateApprovals() {
  const [pending, setPending] = useState<PendingCertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/instructor/certificates', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load certificate requests')
      setPending(data.pending ?? [])
    } catch (error: any) {
      toast.error(error?.message || 'Could not load certificate requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const issue = async (row: PendingCertRow) => {
    setIssuing(true)
    try {
      const res = await fetch('/api/certificate/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: row.student_id,
          courseId: row.capstone_id,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to issue certificate')
      toast.success('Certificate issued')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to issue certificate')
    } finally {
      setIssuing(false)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading certificate requests…</p>

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Certificate Approvals</h1>
        <p className="text-sm text-slate-500">
          Issue certificates to students whose capstone is complete and whose request is pending.
        </p>
      </div>

      {pending.length === 0 && (
        <p className="text-sm text-slate-500">No pending certificate requests</p>
      )}

      {pending.map((row) => (
        <Card key={`${row.student_id}-${row.capstone_id}`} className="rounded-2xl border border-slate-200">
          <CardHeader>
            <CardTitle>{row.capstone_title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Student: <span className="font-medium text-slate-900">{row.student_name}</span>
              </p>
              <Button
                disabled={issuing || Boolean(row.readiness && !row.readiness.readyToIssue)}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={() => issue(row)}
              >
                {row.readiness && !row.readiness.readyToIssue
                  ? 'Requirements pending'
                  : 'Issue certificate'}
              </Button>
            </div>

            {row.readiness && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p>
                  Assignments approved: {row.readiness.assignments.approved}/
                  {row.readiness.assignments.required} · Project milestones approved:{' '}
                  {row.readiness.milestones.approved}/{row.readiness.milestones.required}
                </p>
                {!row.readiness.certificateEnabled && (
                  <p className="mt-1 font-medium text-red-600">
                    Certificates are disabled for this course.
                  </p>
                )}
                {!row.readiness.capstoneCompleted && (
                  <p className="mt-1 font-medium text-amber-700">Capstone is not completed.</p>
                )}
                {row.readiness.blockers.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-4">
                    {row.readiness.blockers.slice(0, 6).map((blocker) => (
                      <li key={`${blocker.type}-${blocker.id}`}>
                        {blocker.type === 'assignment' ? 'Assignment' : 'Milestone'}:{' '}
                        {blocker.title}
                        {blocker.status ? ` (${blocker.status.replace('_', ' ')})` : ' (not started)'}
                      </li>
                    ))}
                  </ul>
                )}
                {row.readiness.blockers.length > 6 && (
                  <p className="mt-1">+{row.readiness.blockers.length - 6} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
