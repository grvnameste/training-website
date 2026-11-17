'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { uploadWithSignedUrl } from '@/lib/api/upload'

type Block = {
  id: string
  type: string
  position: number
  content: Record<string, any>
}

type Resource = {
  id: string
  title: string
  kind: string
  externalUrl: string | null
}

type Lesson = {
  id: string
  title: string
  summary: string | null
  objectives: string[]
  estimatedMinutes: number | null
  completionMode: string
  isPreview: boolean
  videoUrl: string | null
}

const BLOCK_TYPES = [
  'heading',
  'text',
  'callout',
  'code',
  'checklist',
  'image',
  'video',
] as const

const DEFAULT_CONTENT: Record<string, Record<string, unknown>> = {
  heading: { level: 2, text: 'New heading' },
  text: { markdown: 'Write lesson content here.' },
  callout: { variant: 'info', title: 'Note', body: 'Important information.' },
  code: { language: 'ts', code: '// code example', caption: '' },
  checklist: { title: 'Checklist', items: ['First item'] },
  image: { url: '', alt: '', caption: '' },
  video: { url: '', caption: '' },
}

export default function LessonContentEditorPage() {
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settings, setSettings] = useState({
    title: '',
    summary: '',
    objectives: '',
    estimatedMinutes: '',
    completionMode: 'manual',
    isPreview: false,
    videoUrl: '',
  })
  const [newBlockType, setNewBlockType] = useState<(typeof BLOCK_TYPES)[number]>('text')
  const [resourceForm, setResourceForm] = useState({ title: '', url: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [contentRes, blocksRes, resourcesRes, transcriptRes] = await Promise.all([
        fetch(`/api/instructor/courses/${courseId}`, { cache: 'no-store' }),
        fetch(`/api/instructor/lessons/${lessonId}/blocks`, { cache: 'no-store' }),
        fetch(`/api/instructor/lessons/${lessonId}/resources`, { cache: 'no-store' }),
        fetch(`/api/instructor/lessons/${lessonId}/transcript`, { cache: 'no-store' }),
      ])

      const content = await contentRes.json().catch(() => ({}))
      const blockData = await blocksRes.json().catch(() => ({}))
      const resourceData = await resourcesRes.json().catch(() => ({}))
      const transcriptData = await transcriptRes.json().catch(() => ({}))

      const found = (content.sections ?? [])
        .flatMap((section: any) => section.lessons ?? [])
        .find((item: any) => item.id === lessonId)

      if (!found) throw new Error('Lesson not found')
      setLesson(found)
      setSettings({
        title: found.title ?? '',
        summary: found.summary ?? '',
        objectives: (found.objectives ?? []).join('\n'),
        estimatedMinutes: found.estimatedMinutes ? String(found.estimatedMinutes) : '',
        completionMode: found.completionMode ?? 'manual',
        isPreview: Boolean(found.isPreview),
        videoUrl: found.videoUrl ?? '',
      })
      setBlocks(blockData.blocks ?? [])
      setResources(resourceData.resources ?? [])
      setTranscript(transcriptData.transcript?.fullText ?? '')
    } catch (error: any) {
      toast.error(error?.message || 'Could not load lesson content')
      setLesson(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId])

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch(`/api/instructor/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: settings.title,
          summary: settings.summary || null,
          objectives: settings.objectives.split('\n').map((s) => s.trim()).filter(Boolean),
          estimatedMinutes: settings.estimatedMinutes ? Number(settings.estimatedMinutes) : null,
          completionMode: settings.completionMode,
          isPreview: settings.isPreview,
          videoUrl: settings.videoUrl || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save lesson settings')
      toast.success('Lesson settings saved')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not save lesson settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const uploadLessonVideo = async (file: File) => {
    try {
      toast.loading('Uploading lesson video…', { id: 'lesson-video-upload' })
      const uploaded = await uploadWithSignedUrl(file, {
        purpose: 'lesson-video',
        courseId,
        lessonId,
      })
      setSettings((prev) => ({ ...prev, videoUrl: uploaded.publicUrl ?? '' }))
      toast.success('Video uploaded. Save lesson settings to apply it.', {
        id: 'lesson-video-upload',
      })
    } catch (error: any) {
      toast.error(error?.message || 'Video upload failed', { id: 'lesson-video-upload' })
    }
  }

  const uploadResourceFile = async (file: File) => {
    try {
      toast.loading('Uploading resource…', { id: 'resource-upload' })
      const uploaded = await uploadWithSignedUrl(file, {
        purpose: 'lesson-resource',
        courseId,
        lessonId,
      })
      const res = await fetch(`/api/instructor/lessons/${lessonId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name,
          kind: 'download',
          storagePath: uploaded.storagePath,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save resource')
      await load()
      toast.success('Resource uploaded', { id: 'resource-upload' })
    } catch (error: any) {
      toast.error(error?.message || 'Resource upload failed', { id: 'resource-upload' })
    }
  }

  const addBlock = async () => {
    try {
      const res = await fetch(`/api/instructor/lessons/${lessonId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newBlockType,
          content: DEFAULT_CONTENT[newBlockType] ?? {},
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not add block')
      await load()
      toast.success('Block added')
    } catch (error: any) {
      toast.error(error?.message || 'Could not add block')
    }
  }

  const moveBlock = async (blockId: string, direction: -1 | 1) => {
    const index = blocks.findIndex((block) => block.id === blockId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= blocks.length) return
    const next = [...blocks]
    ;[next[index], next[target]] = [next[target], next[index]]
    setBlocks(next)
    try {
      const res = await fetch(`/api/instructor/lessons/${lessonId}/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: next.map((block) => block.id) }),
      })
      if (!res.ok) throw new Error('Could not reorder blocks')
    } catch (error: any) {
      toast.error(error?.message || 'Could not reorder blocks')
      await load()
    }
  }

  const deleteBlock = async (blockId: string) => {
    if (!confirm('Delete this block?')) return
    try {
      const res = await fetch(`/api/instructor/lesson-blocks/${blockId}`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not delete block')
      setBlocks((prev) => prev.filter((block) => block.id !== blockId))
    } catch (error: any) {
      toast.error(error?.message || 'Could not delete block')
    }
  }

  const addResource = async () => {
    if (!resourceForm.title.trim() || !resourceForm.url.trim()) {
      toast.error('Enter a title and URL')
      return
    }
    try {
      const res = await fetch(`/api/instructor/lessons/${lessonId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resourceForm.title.trim(),
          kind: 'link',
          externalUrl: resourceForm.url.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not add resource')
      setResourceForm({ title: '', url: '' })
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not add resource')
    }
  }

  const deleteResource = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/instructor/resources/${resourceId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not remove resource')
      setResources((prev) => prev.filter((resource) => resource.id !== resourceId))
    } catch (error: any) {
      toast.error(error?.message || 'Could not remove resource')
    }
  }

  const saveTranscript = async () => {
    try {
      const res = await fetch(`/api/instructor/lessons/${lessonId}/transcript`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullText: transcript }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save transcript')
      toast.success('Transcript saved')
    } catch (error: any) {
      toast.error(error?.message || 'Could not save transcript')
    }
  }

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.position - b.position),
    [blocks]
  )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-slate-500">Lesson not found.</p>
        <Link href={`/teacher/courses/${courseId}/content`}>
          <Button className="mt-4" variant="outline">Back to content</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div>
        <Link
          href={`/teacher/courses/${courseId}/content`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to course content
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{lesson.title}</h1>
        <p className="text-sm text-slate-500">Edit lesson settings, content blocks, resources, and transcript.</p>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Lesson settings</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Title</span>
            <Input value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Summary</span>
            <textarea
              rows={2}
              value={settings.summary}
              onChange={(e) => setSettings({ ...settings, summary: e.target.value })}
              className="w-full rounded-md border border-slate-200 p-3 text-sm"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Objectives (one per line)</span>
            <textarea
              rows={4}
              value={settings.objectives}
              onChange={(e) => setSettings({ ...settings, objectives: e.target.value })}
              className="w-full rounded-md border border-slate-200 p-3 text-sm"
            />
          </label>
          <div className="space-y-4">
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimated minutes</span>
              <Input
                type="number"
                min={1}
                value={settings.estimatedMinutes}
                onChange={(e) => setSettings({ ...settings, estimatedMinutes: e.target.value })}
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completion mode</span>
              <select
                value={settings.completionMode}
                onChange={(e) => setSettings({ ...settings, completionMode: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              >
                <option value="manual">Manual</option>
                <option value="video_ended">Video ended</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.isPreview}
                onChange={(e) => setSettings({ ...settings, isPreview: e.target.checked })}
              />
              Public preview lesson
            </label>
          </div>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lesson video
            </span>
            <Input
              type="file"
              accept="video/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void uploadLessonVideo(file)
              }}
            />
            {settings.videoUrl && (
              <p className="truncate text-xs text-slate-500">Current: {settings.videoUrl}</p>
            )}
          </label>
          <div className="flex justify-end md:col-span-2">
            <Button onClick={saveSettings} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save lesson settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Content blocks</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={newBlockType}
              onChange={(e) => setNewBlockType(e.target.value as typeof newBlockType)}
              className="h-9 rounded-md border border-slate-200 px-2 text-xs"
            >
              {BLOCK_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Button size="sm" onClick={addBlock}>
              <Plus className="mr-1 h-4 w-4" /> Add block
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedBlocks.length === 0 && (
            <p className="text-sm text-slate-500">No blocks yet. Add one above.</p>
          )}
          {sortedBlocks.map((block, index) => (
            <div key={block.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  {block.type}
                </span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" aria-label="Move block up" className="h-7 w-7" disabled={index === 0} onClick={() => moveBlock(block.id, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Move block down" className="h-7 w-7" disabled={index === sortedBlocks.length - 1} onClick={() => moveBlock(block.id, 1)}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete block" className="h-7 w-7 text-red-600" onClick={() => deleteBlock(block.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <BlockEditor
                block={block}
                onSaved={load}
                courseId={courseId}
                lessonId={lessonId}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Resources</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <a
                href={
                  resource.kind === 'download'
                    ? `/api/learning/resources/${resource.id}/download`
                    : resource.externalUrl || '#'
                }
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {resource.title}
              </a>
              <Button size="icon" variant="ghost" aria-label="Delete resource" className="h-7 w-7 text-red-600" onClick={() => deleteResource(resource.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="Resource title"
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
            />
            <Input
              placeholder="https://…"
              value={resourceForm.url}
              onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
            />
            <Button onClick={addResource}>Add link</Button>
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Upload a downloadable file
            </p>
            <Input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void uploadResourceFile(file)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-base">Transcript</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <textarea
            rows={10}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste or write the lesson transcript…"
            className="w-full rounded-xl border border-slate-200 p-4 text-sm"
          />
          <div className="flex justify-end">
            <Button onClick={saveTranscript}>Save transcript</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BlockEditor({
  block,
  onSaved,
  courseId,
  lessonId,
}: {
  block: Block
  onSaved: () => Promise<void>
  courseId: string
  lessonId: string
}) {
  const [content, setContent] = useState<Record<string, any>>(block.content ?? {})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/instructor/lesson-blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: block.type, content }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save block')
      toast.success('Block saved')
      await onSaved()
    } catch (error: any) {
      toast.error(error?.message || 'Could not save block')
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: unknown) => setContent((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-3">
      {block.type === 'heading' && (
        <div className="grid gap-2 sm:grid-cols-[80px_1fr]">
          <select
            value={content.level ?? 2}
            onChange={(e) => update('level', Number(e.target.value))}
            className="h-9 rounded-md border border-slate-200 px-2 text-sm"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <Input value={content.text ?? ''} onChange={(e) => update('text', e.target.value)} />
        </div>
      )}

      {block.type === 'text' && (
        <textarea
          rows={5}
          value={content.markdown ?? ''}
          onChange={(e) => update('markdown', e.target.value)}
          className="w-full rounded-md border border-slate-200 p-3 text-sm"
        />
      )}

      {block.type === 'callout' && (
        <div className="space-y-2">
          <Input placeholder="Title" value={content.title ?? ''} onChange={(e) => update('title', e.target.value)} />
          <textarea
            rows={3}
            placeholder="Body"
            value={content.body ?? ''}
            onChange={(e) => update('body', e.target.value)}
            className="w-full rounded-md border border-slate-200 p-3 text-sm"
          />
        </div>
      )}

      {block.type === 'code' && (
        <div className="space-y-2">
          <Input placeholder="Language" value={content.language ?? ''} onChange={(e) => update('language', e.target.value)} />
          <textarea
            rows={6}
            placeholder="Code"
            value={content.code ?? ''}
            onChange={(e) => update('code', e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-slate-100"
          />
        </div>
      )}

      {block.type === 'checklist' && (
        <div className="space-y-2">
          <Input placeholder="Title" value={content.title ?? ''} onChange={(e) => update('title', e.target.value)} />
          <textarea
            rows={4}
            placeholder="One item per line"
            value={(content.items ?? []).join('\n')}
            onChange={(e) => update('items', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
            className="w-full rounded-md border border-slate-200 p-3 text-sm"
          />
        </div>
      )}

      {(block.type === 'image' || block.type === 'video') && (
        <div className="space-y-2">
          <Input placeholder="URL" value={content.url ?? ''} onChange={(e) => update('url', e.target.value)} />
          <Input
            placeholder={block.type === 'image' ? 'Alt text' : 'Caption'}
            value={block.type === 'image' ? content.alt ?? '' : content.caption ?? ''}
            onChange={(e) => update(block.type === 'image' ? 'alt' : 'caption', e.target.value)}
          />
          {block.type === 'image' && (
            <Input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                try {
                  toast.loading('Uploading image…', { id: `image-${block.id}` })
                  const uploaded = await uploadWithSignedUrl(file, {
                    purpose: 'lesson-image',
                    courseId,
                    lessonId,
                  })
                  update('url', uploaded.publicUrl ?? '')
                  toast.success('Image uploaded. Save block to apply.', {
                    id: `image-${block.id}`,
                  })
                } catch (error: any) {
                  toast.error(error?.message || 'Image upload failed', {
                    id: `image-${block.id}`,
                  })
                }
              }}
            />
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
          Save block
        </Button>
      </div>
    </div>
  )
}
