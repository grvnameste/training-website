'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { uploadWithSignedUrl } from '@/lib/api/upload'

type Lesson = {
  id: string
  title: string
  estimatedMinutes: number | null
  isPreview: boolean
  completionMode: string
}

type Section = { id: string; title: string; lessons: Lesson[] }

type Content = {
  course: {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    level: string
    estimatedMinutes: number | null
    outcomes: string[]
    prerequisites: string[]
    tags: string[]
    whatYouBuild: string | null
    certificateEnabled: boolean
    status: string
    thumbnailUrl: string | null
  }
  sections: Section[]
}

export default function InstructorContentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newLessonTitles, setNewLessonTitles] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    level: 'beginner',
    estimatedMinutes: '',
    outcomes: '',
    prerequisites: '',
    tags: '',
    whatYouBuild: '',
    certificateEnabled: true,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load course content')
      setContent(data)
      setForm({
        title: data.course.title ?? '',
        subtitle: data.course.subtitle ?? '',
        description: data.course.description ?? '',
        level: data.course.level ?? 'beginner',
        estimatedMinutes: data.course.estimatedMinutes ? String(data.course.estimatedMinutes) : '',
        outcomes: (data.course.outcomes ?? []).join('\n'),
        prerequisites: (data.course.prerequisites ?? []).join('\n'),
        tags: (data.course.tags ?? []).join(', '),
        whatYouBuild: data.course.whatYouBuild ?? '',
        certificateEnabled: Boolean(data.course.certificateEnabled),
      })
    } catch (error: any) {
      toast.error(error?.message || 'Could not load course content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const saveMetadata = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || null,
          description: form.description || null,
          level: form.level,
          estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : null,
          outcomes: form.outcomes.split('\n').map((s) => s.trim()).filter(Boolean),
          prerequisites: form.prerequisites.split('\n').map((s) => s.trim()).filter(Boolean),
          tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
          whatYouBuild: form.whatYouBuild || null,
          certificateEnabled: form.certificateEnabled,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save course')
      toast.success('Course details saved')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not save course')
    } finally {
      setSaving(false)
    }
  }

  const publish = async () => {
    setPublishing(true)
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/publish`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not publish course')
      toast.success('Course published')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not publish course')
    } finally {
      setPublishing(false)
    }
  }

  const uploadThumbnail = async (file: File) => {
    try {
      toast.loading('Uploading thumbnail…', { id: 'thumbnail-upload' })
      const uploaded = await uploadWithSignedUrl(file, {
        purpose: 'course-thumbnail',
        courseId,
      })
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: uploaded.publicUrl }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save thumbnail')
      await load()
      toast.success('Thumbnail updated', { id: 'thumbnail-upload' })
    } catch (error: any) {
      toast.error(error?.message || 'Thumbnail upload failed', { id: 'thumbnail-upload' })
    }
  }

  const addSection = async () => {
    if (!newSectionTitle.trim()) return
    const res = await fetch(`/api/instructor/courses/${courseId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSectionTitle.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data?.error || 'Could not add section')
      return
    }
    setNewSectionTitle('')
    await load()
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and its lessons?')) return
    const res = await fetch(`/api/instructor/sections/${sectionId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data?.error || 'Could not delete section')
      return
    }
    await load()
  }

  const addLesson = async (sectionId: string) => {
    const title = newLessonTitles[sectionId]?.trim()
    if (!title) return
    const res = await fetch(`/api/instructor/sections/${sectionId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data?.error || 'Could not add lesson')
      return
    }
    setNewLessonTitles((prev) => ({ ...prev, [sectionId]: '' }))
    await load()
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    const res = await fetch(`/api/instructor/lessons/${lessonId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data?.error || 'Could not delete lesson')
      return
    }
    await load()
  }

  if (loading || !content) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/teacher/courses" className="text-xs font-medium text-slate-500 hover:text-blue-600">
            Back to courses
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Course content</h1>
          <p className="text-sm text-slate-500">
            Author outcomes, lesson blocks, resources, and transcripts.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/teacher/courses/${courseId}/assignments`}>
            <Button variant="outline">Assignments</Button>
          </Link>
          <Link href={`/teacher/courses/${courseId}/projects`}>
            <Button variant="outline">Projects</Button>
          </Link>
          <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
            Preview
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={publish}
            disabled={publishing || content.course.status === 'published'}
          >
            {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {content.course.status === 'published' ? 'Published' : 'Publish'}
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">Course details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Level">
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <Field label="Subtitle" className="md:col-span-2">
            <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-slate-200 p-3 text-sm"
            />
          </Field>
          <Field label="Estimated minutes">
            <Input
              type="number"
              min={1}
              value={form.estimatedMinutes}
              onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
            />
          </Field>
          <Field label="Tags (comma separated)">
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </Field>
          <Field label="Outcomes (one per line)">
            <textarea
              rows={4}
              value={form.outcomes}
              onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
              className="w-full rounded-md border border-slate-200 p-3 text-sm"
            />
          </Field>
          <Field label="Prerequisites (one per line)">
            <textarea
              rows={4}
              value={form.prerequisites}
              onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
              className="w-full rounded-md border border-slate-200 p-3 text-sm"
            />
          </Field>
          <Field label="Course thumbnail" className="md:col-span-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void uploadThumbnail(file)
              }}
            />
            {content.course.thumbnailUrl && (
              <img
                src={content.course.thumbnailUrl}
                alt="Course thumbnail"
                className="mt-2 h-24 w-40 rounded-lg border border-slate-200 object-cover"
              />
            )}
          </Field>
          <Field label="What you will build" className="md:col-span-2">
            <textarea
              rows={3}
              value={form.whatYouBuild}
              onChange={(e) => setForm({ ...form, whatYouBuild: e.target.value })}
              className="w-full rounded-md border border-slate-200 p-3 text-sm"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.certificateEnabled}
              onChange={(e) => setForm({ ...form, certificateEnabled: e.target.checked })}
            />
            Certificate enabled
          </label>
          <div className="flex justify-end md:col-span-2">
            <Button onClick={saveMetadata} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={newSectionTitle}
              onChange={(event) => setNewSectionTitle(event.target.value)}
              placeholder="New section title"
            />
            <Button onClick={addSection}>
              <Plus className="mr-1 h-4 w-4" /> Add section
            </Button>
          </div>

          {content.sections.length === 0 && (
            <p className="text-sm text-slate-500">No sections yet.</p>
          )}
          {content.sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                <span className="text-sm font-semibold text-slate-800">{section.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => deleteSection(section.id)}
                >
                  Delete section
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {section.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min` : 'No estimate'} ·{' '}
                        {lesson.completionMode === 'video_ended' ? 'completes on video end' : 'manual completion'}
                        {lesson.isPreview ? ' · preview' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}>
                        <Button size="sm" variant="outline">Edit content</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteLesson(lesson.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row">
                  <Input
                    value={newLessonTitles[section.id] ?? ''}
                    onChange={(event) =>
                      setNewLessonTitles((prev) => ({
                        ...prev,
                        [section.id]: event.target.value,
                      }))
                    }
                    placeholder="New lesson title"
                  />
                  <Button variant="outline" onClick={() => addLesson(section.id)}>
                    <Plus className="mr-1 h-4 w-4" /> Add lesson
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  )
}
