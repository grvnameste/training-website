'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

type Assignment = {
  id: string
  title: string
  dueAt: string | null
  status: string
  maxAttempts: number
  isRequired: boolean
  rubricId: string | null
  submissionCount: number
  pendingCount: number
}

type CourseContent = {
  course: { id: string; title: string }
}

export default function InstructorAssignmentsPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<CourseContent['course'] | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    instructions: '',
    dueAt: '',
    maxAttempts: '1',
    submissionTypes: ['text'] as string[],
  })

  const load = async () => {
    setLoading(true)
    try {
      const [courseRes, assignmentsRes] = await Promise.all([
        fetch(`/api/instructor/courses/${courseId}`, { cache: 'no-store' }),
        fetch(`/api/instructor/courses/${courseId}/assignments`, { cache: 'no-store' }),
      ])
      const courseData = await courseRes.json().catch(() => ({}))
      const assignmentData = await assignmentsRes.json().catch(() => ({}))
      if (courseRes.ok) setCourse(courseData.course)
      if (assignmentsRes.ok) setAssignments(assignmentData.assignments ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const toggleType = (type: string) => {
    setForm((prev) => ({
      ...prev,
      submissionTypes: prev.submissionTypes.includes(type)
        ? prev.submissionTypes.filter((item) => item !== type)
        : [...prev.submissionTypes, type],
    }))
  }

  const create = async () => {
    if (!form.title.trim() || !form.instructions.trim()) {
      toast.error('Title and instructions are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          instructions: form.instructions.trim(),
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
          maxAttempts: Number(form.maxAttempts || 1),
          submissionTypes: form.submissionTypes.length ? form.submissionTypes : ['text'],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not create assignment')
      toast.success('Assignment draft created')
      setForm({
        title: '',
        instructions: '',
        dueAt: '',
        maxAttempts: '1',
        submissionTypes: ['text'],
      })
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not create assignment')
    } finally {
      setSaving(false)
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
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div>
        <Link
          href={`/teacher/courses/${courseId}/content`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course content
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Assignments
        </h1>
        <p className="text-sm text-slate-500">
          {course?.title} · create graded work, rubrics, and review queues.
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Create an assignment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Assignment title"
          />
          <textarea
            rows={4}
            value={form.instructions}
            onChange={(event) => setForm({ ...form, instructions: event.target.value })}
            placeholder="Instructions, requirements, and acceptance criteria"
            className="w-full rounded-md border border-slate-200 p-3 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Due date
              </span>
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => setForm({ ...form, dueAt: event.target.value })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Max attempts
              </span>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.maxAttempts}
                onChange={(event) => setForm({ ...form, maxAttempts: event.target.value })}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {['text', 'file', 'link', 'repo'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                  form.submissionTypes.includes(type)
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={create} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-sm text-slate-500">No assignments yet.</p>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="rounded-2xl border border-slate-200 bg-white">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{assignment.title}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                      {assignment.status}
                    </span>
                    {!assignment.rubricId && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Rubric required
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {assignment.dueAt
                      ? `Due ${new Date(assignment.dueAt).toLocaleString()}`
                      : 'No deadline'}{' '}
                    · {assignment.submissionCount} submissions · {assignment.pendingCount} pending
                  </p>
                </div>
                <Link href={`/teacher/assignments/${assignment.id}`}>
                  <Button variant="outline">Manage</Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
