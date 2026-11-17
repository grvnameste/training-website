'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, Plus, Save, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Milestone = {
  id: string
  title: string
  description: string | null
  acceptanceCriteria: string | null
  estimatedHours: number | null
  dueOffsetDays: number | null
  isRequired: boolean
}

type Phase = {
  id: string
  title: string
  description: string | null
  milestones: Milestone[]
}

type Template = {
  id: string
  courseId: string
  title: string
  description: string | null
  status: string
}

export default function ProjectTemplateEditorPage() {
  const params = useParams()
  const templateId = params.templateId as string
  const [template, setTemplate] = useState<Template | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPhaseTitle, setNewPhaseTitle] = useState('')
  const [milestoneForms, setMilestoneForms] = useState<
    Record<string, { title: string; description: string; acceptance: string; hours: string; offset: string }>
  >({})

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/instructor/projects/${templateId}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load project template')
      setTemplate(data.template)
      setPhases(data.phases ?? [])
    } catch (error: any) {
      toast.error(error?.message || 'Could not load project template')
      setTemplate(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId])

  const saveTemplate = async () => {
    if (!template) return
    setSaving(true)
    try {
      const res = await fetch(`/api/instructor/projects/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template.title,
          description: template.description || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save template')
      toast.success('Template saved')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not save template')
    } finally {
      setSaving(false)
    }
  }

  const addPhase = async () => {
    if (!newPhaseTitle.trim()) return
    const res = await fetch(`/api/instructor/projects/${templateId}/phases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newPhaseTitle.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data?.error || 'Could not add phase')
      return
    }
    setNewPhaseTitle('')
    await load()
  }

  const removePhase = async (phaseId: string) => {
    if (!confirm('Delete this phase and its milestones?')) return
    const res = await fetch(`/api/instructor/project-phases/${phaseId}`, {
      method: 'DELETE',
    })
    if (res.ok) await load()
    else toast.error('Could not delete phase')
  }

  const addMilestone = async (phaseId: string) => {
    const form = milestoneForms[phaseId]
    if (!form?.title?.trim()) {
      toast.error('Milestone title is required')
      return
    }
    const res = await fetch(`/api/instructor/project-phases/${phaseId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || null,
        acceptanceCriteria: form.acceptance.trim() || null,
        estimatedHours: form.hours ? Number(form.hours) : null,
        dueOffsetDays: form.offset ? Number(form.offset) : null,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data?.error || 'Could not add milestone')
      return
    }
    setMilestoneForms((prev) => ({
      ...prev,
      [phaseId]: { title: '', description: '', acceptance: '', hours: '', offset: '' },
    }))
    await load()
  }

  const removeMilestone = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return
    const res = await fetch(`/api/instructor/project-milestones/${milestoneId}`, {
      method: 'DELETE',
    })
    if (res.ok) await load()
    else toast.error('Could not delete milestone')
  }

  const publish = async () => {
    const res = await fetch(`/api/instructor/projects/${templateId}/publish`, {
      method: 'POST',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data?.error || 'Could not publish template')
      return
    }
    toast.success('Project template published')
    await load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-slate-500">Project template not found.</p>
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
            href={`/teacher/courses/${template.courseId}/projects`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {template.title}
          </h1>
          <p className="text-sm text-slate-500">
            {template.status} · configure phases and milestones
          </p>
        </div>
        <Button
          onClick={publish}
          disabled={template.status === 'published'}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Send className="mr-2 h-4 w-4" />
          {template.status === 'published' ? 'Published' : 'Publish template'}
        </Button>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Template details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={template.title}
            onChange={(event) => setTemplate({ ...template, title: event.target.value })}
          />
          <textarea
            rows={3}
            value={template.description ?? ''}
            onChange={(event) => setTemplate({ ...template, description: event.target.value })}
            className="w-full rounded-md border border-slate-200 p-3 text-sm"
            placeholder="Project brief"
          />
          <div className="flex justify-end">
            <Button onClick={saveTemplate} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Phases & milestones</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={newPhaseTitle}
              onChange={(event) => setNewPhaseTitle(event.target.value)}
              placeholder="New phase title"
            />
            <Button onClick={addPhase}>
              <Plus className="mr-1 h-4 w-4" /> Add phase
            </Button>
          </div>

          {phases.map((phase) => {
            const form =
              milestoneForms[phase.id] ?? {
                title: '',
                description: '',
                acceptance: '',
                hours: '',
                offset: '',
              }
            return (
              <div key={phase.id} className="rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                  <span className="text-sm font-semibold text-slate-800">{phase.title}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-red-600"
                    onClick={() => removePhase(phase.id)}
                  >
                    Delete phase
                  </Button>
                </div>
                <div className="space-y-3 p-4">
                  {phase.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start justify-between rounded-lg border border-slate-200 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{milestone.title}</p>
                        <p className="text-xs text-slate-500">
                          {milestone.estimatedHours ? `${milestone.estimatedHours}h · ` : ''}
                          {milestone.dueOffsetDays !== null ? `due +${milestone.dueOffsetDays}d · ` : ''}
                          {milestone.isRequired ? 'required' : 'optional'}
                        </p>
                        {milestone.acceptanceCriteria && (
                          <p className="mt-1 text-xs text-slate-500">
                            {milestone.acceptanceCriteria}
                          </p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete milestone"
                        className="text-red-600"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid gap-2 rounded-xl border border-dashed border-slate-300 p-3 sm:grid-cols-2">
                    <Input
                      placeholder="Milestone title"
                      value={form.title}
                      onChange={(event) =>
                        setMilestoneForms((prev) => ({
                          ...prev,
                          [phase.id]: { ...form, title: event.target.value },
                        }))
                      }
                    />
                    <Input
                      placeholder="Acceptance criteria"
                      value={form.acceptance}
                      onChange={(event) =>
                        setMilestoneForms((prev) => ({
                          ...prev,
                          [phase.id]: { ...form, acceptance: event.target.value },
                        }))
                      }
                    />
                    <Input
                      placeholder="Estimated hours"
                      type="number"
                      min={1}
                      value={form.hours}
                      onChange={(event) =>
                        setMilestoneForms((prev) => ({
                          ...prev,
                          [phase.id]: { ...form, hours: event.target.value },
                        }))
                      }
                    />
                    <Input
                      placeholder="Due after N days"
                      type="number"
                      min={0}
                      value={form.offset}
                      onChange={(event) =>
                        setMilestoneForms((prev) => ({
                          ...prev,
                          [phase.id]: { ...form, offset: event.target.value },
                        }))
                      }
                    />
                    <textarea
                      rows={2}
                      placeholder="Milestone description"
                      value={form.description}
                      onChange={(event) =>
                        setMilestoneForms((prev) => ({
                          ...prev,
                          [phase.id]: { ...form, description: event.target.value },
                        }))
                      }
                      className="rounded-md border border-slate-200 p-2 text-sm sm:col-span-2"
                    />
                    <div className="sm:col-span-2 flex justify-end">
                      <Button size="sm" onClick={() => addMilestone(phase.id)}>
                        <Plus className="mr-1 h-4 w-4" /> Add milestone
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
