'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, FolderKanban, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

type Template = {
  id: string
  title: string
  description: string | null
  status: string
  instanceCount: number
  milestoneCount: number
}

export default function InstructorProjectsPage() {
  const params = useParams()
  const courseId = params.id as string
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/projects`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load projects')
      setTemplates(data.templates ?? [])
    } catch (error: any) {
      toast.error(error?.message || 'Could not load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const create = async () => {
    if (!form.title.trim()) {
      toast.error('Project title is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not create project')
      toast.success('Project template created')
      setForm({ title: '', description: '' })
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not create project')
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
          Project templates
        </h1>
        <p className="text-sm text-slate-500">
          Build configurable phases and milestones for project-based learning.
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Create a template</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="e.g. Employee Management System"
          />
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Project brief and expected outcome"
            className="w-full rounded-md border border-slate-200 p-3 text-sm"
          />
          <div className="flex justify-end">
            <Button onClick={create} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create template
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No project templates yet.</p>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="rounded-2xl border border-slate-200 bg-white">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{template.title}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                      {template.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {template.milestoneCount} milestones · {template.instanceCount} started
                  </p>
                </div>
                <Link href={`/teacher/projects/${template.id}`}>
                  <Button variant="outline">Edit template</Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
