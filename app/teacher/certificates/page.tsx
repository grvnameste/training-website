<<<<<<< HEAD
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
=======
//app/teacher/certificates/page.tsx
'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

type PendingCertRow = {
  student_id: string
  capstone_id: string
  stage3_submitted: boolean
  certificate_requested: boolean
  completed: boolean
  certificate_issued: boolean

  student_name?: string
  capstone_title?: string
}

  
export default function TeacherCertificateApprovals() {
    const [pending, setPending] = useState<PendingCertRow[]>([])

    const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)

    const { data, error } = await supabase
    .from('student_capstone_progress')
    .select(`
      student_id,
      capstone_id,
      stage3_submitted,
      certificate_requested,
      completed,
      certificate_issued
    `)
    .eq('certificate_requested', true)
    .eq('certificate_issued', false)
    .eq('stage3_submitted', true)
      console.log('TEACHER DATA:', data)
  console.log('TEACHER ERROR:', error)
  
    

  if (!error && data) {
    /* ============ COLLECT IDS ============ */
    const studentIds = Array.from(new Set(data.map(d => d.student_id)))
    const capstoneIds = Array.from(new Set(data.map(d => d.capstone_id)))
  
    /* ============ FETCH STUDENTS ============ */
    let studentMap: Record<string, string> = {}
    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, name')
        .in('id', studentIds)
  
      studentMap =
        students?.reduce<Record<string, string>>((acc, s) => {
          acc[s.id] = s.name
          return acc
        }, {}) ?? {}
    }
  
    /* ============ FETCH CAPSTONE TITLES ============ */
    let capstoneMap: Record<string, string> = {}
    if (capstoneIds.length > 0) {
      const { data: capstones } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', capstoneIds)
  
      capstoneMap =
        capstones?.reduce<Record<string, string>>((acc, c) => {
          acc[c.id] = c.title
          return acc
        }, {}) ?? {}
    }
  
    /* ============ FINAL MERGE ============ */
    const finalData: PendingCertRow[] = data.map(row => ({
      ...row,
      student_name: studentMap[row.student_id] ?? 'Unknown Student',
      capstone_title: capstoneMap[row.capstone_id] ?? 'Unknown Capstone',
    }))
  
    setPending(finalData)
  }
  



    setLoading(false)
  }

  const [issuing, setIssuing] = useState(false)


  const approve = async (studentId: string, capstoneId: string) => {
    const { error } = await supabase
      .from('student_capstone_progress')
      .update({
        completed: true
      })
      .eq('student_id', studentId)
      .eq('capstone_id', capstoneId)
  
    if (error) {
      alert(error.message)
      return false
    }
  
    return true
  }
  
  

  if (loading) return <p>Loading...</p>

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Certificate Approvals</h1>

      {pending.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No pending certificate requests
        </p>
      )}

      {pending.map(p => (
        <Card key={`${p.student_id}-${p.capstone_id}`}>
          <CardHeader>
          <CardTitle>
  {p.capstone_title}
</CardTitle>          </CardHeader>

          <CardContent className="flex items-center justify-between">
            <div>
            

            <p className="text-sm text-gray-600">
  Student: <span className="font-medium">{p.student_name}</span>
</p>
            </div>

          

            <Button
  disabled={issuing}
  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
  onClick={async () => {
    setIssuing(true)

    const approved = await approve(p.student_id, p.capstone_id)
    if (!approved) {
      setIssuing(false)
      return
    }


    const res = await fetch('/api/certificate/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        studentId: p.student_id,
        courseId: p.capstone_id,
        studentName: p.student_name,
        courseName: p.capstone_title,
      }),
    })
    
    setIssuing(false)

    if (!res.ok) {
      alert('Failed to issue certificate')
      return
    }

    alert('Certificate approved & issued')
    load()
  }}
>
  🎓 Issue Certificate
</Button>

          </CardContent>
        </Card>
      ))}
    </div>
  )
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
