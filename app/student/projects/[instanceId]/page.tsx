'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle2, Circle, Download, Loader2, Lock, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { uploadWithSignedUrl } from '@/lib/api/upload'

type SubmissionFile = { id: string; fileName: string }

type Submission = {
  id: string
  attempt: number
  content: string | null
  repoUrl: string | null
  linkUrl: string | null
  decision: string | null
  feedback: string | null
  submittedAt: string
  files: SubmissionFile[]
}

type Milestone = {
  id: string
  title: string
  description: string | null
  acceptanceCriteria: string | null
  estimatedHours: number | null
  dueOffsetDays: number | null
  isRequired: boolean
  instanceMilestone: {
    id: string
    status: string
    dueAt: string | null
    submittedAt: string | null
  } | null
  submissions: Submission[]
}

type Phase = { id: string; title: string; description: string | null; milestones: Milestone[] }

type Detail = {
  instance: {
    id: string
    courseId: string
    status: string
    startedAt: string
    completedAt: string | null
  }
  template: { id: string; title: string; description: string | null }
  phases: Phase[]
}

type Draft = {
  content: string
  repoUrl: string
  linkUrl: string
  files: { storagePath: string; fileName: string; mimeType?: string; sizeBytes?: number }[]
}

const EMPTY_DRAFT: Draft = { content: '', repoUrl: '', linkUrl: '', files: [] }

export default function StudentProjectPage() {
  const params = useParams()
  const instanceId = params.instanceId as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/me/projects/${instanceId}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load project')
      setDetail(data)
    } catch (error: any) {
      toast.error(error?.message || 'Could not load project')
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId])

  const updateDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? EMPTY_DRAFT), ...patch },
    }))
  }

  const uploadFile = async (milestone: Milestone, file: File) => {
    if (!milestone.instanceMilestone) return
    const id = milestone.instanceMilestone.id
    try {
      toast.loading(`Uploading ${file.name}…`, { id: `project-${file.name}` })
      const uploaded = await uploadWithSignedUrl(file, {
        purpose: 'project-milestone-file',
        courseId: detail!.instance.courseId,
        instanceMilestoneId: id,
      })
      updateDraft(id, {
        files: [
          ...(drafts[id]?.files ?? []),
          {
            storagePath: uploaded.storagePath,
            fileName: file.name,
            mimeType: file.type || undefined,
            sizeBytes: file.size,
          },
        ],
      })
      toast.success(`${file.name} ready`, { id: `project-${file.name}` })
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed', { id: `project-${file.name}` })
    }
  }

  const submit = async (milestone: Milestone) => {
    if (!milestone.instanceMilestone) return
    const id = milestone.instanceMilestone.id
    const draft = drafts[id] ?? EMPTY_DRAFT
    setSubmitting(id)
    try {
      const res = await fetch(`/api/me/project-milestones/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: draft.content.trim() || null,
          repoUrl: draft.repoUrl.trim() || null,
          linkUrl: draft.linkUrl.trim() || null,
          files: draft.files,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not submit milestone')
      toast.success('Milestone submitted')
      setDrafts((prev) => ({ ...prev, [id]: EMPTY_DRAFT }))
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Could not submit milestone')
    } finally {
      setSubmitting(null)
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
        <p className="text-sm text-slate-500">Project not found.</p>
        <Link href="/student/projects">
          <Button className="mt-4" variant="outline">Back to projects</Button>
        </Link>
      </div>
    )
  }

  const allMilestones = detail.phases.flatMap((phase) => phase.milestones)
  const approved = allMilestones.filter(
    (milestone) => milestone.instanceMilestone?.status === 'approved'
  ).length

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div>
        <Link
          href="/student/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {detail.template.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {detail.template.description} · {approved}/{allMilestones.length} milestones approved
        </p>
      </div>

      {detail.phases.map((phase, phaseIndex) => (
        <div key={phase.id} className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Phase {phaseIndex + 1}
            </p>
            <h2 className="text-xl font-semibold text-slate-900">{phase.title}</h2>
            {phase.description && (
              <p className="text-sm text-slate-500">{phase.description}</p>
            )}
          </div>

          {phase.milestones.map((milestone, milestoneIndex) => {
            const instanceMilestone = milestone.instanceMilestone
            const status = instanceMilestone?.status ?? 'locked'
            const isOpen = status === 'available' || status === 'changes_requested'
            const draft = drafts[instanceMilestone?.id ?? ''] ?? EMPTY_DRAFT
            const latestSubmission = milestone.submissions[0] ?? null

            return (
              <Card key={milestone.id} className="rounded-2xl border border-slate-200 bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        {phaseIndex + 1}.{milestoneIndex + 1} {milestone.title}
                      </CardTitle>
                      <p className="mt-1 text-xs text-slate-500">
                        {milestone.estimatedHours
                          ? `${milestone.estimatedHours}h · `
                          : ''}
                        {milestone.dueOffsetDays !== null
                          ? `due +${milestone.dueOffsetDays} days · `
                          : ''}
                        {milestone.isRequired ? 'required' : 'optional'}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {milestone.description && (
                    <p className="whitespace-pre-line text-sm text-slate-700">
                      {milestone.description}
                    </p>
                  )}
                  {milestone.acceptanceCriteria && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Acceptance criteria
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                        {milestone.acceptanceCriteria}
                      </p>
                    </div>
                  )}

                  {latestSubmission && (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Latest submission · attempt {latestSubmission.attempt}
                      </p>
                      {latestSubmission.content && (
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                          {latestSubmission.content}
                        </p>
                      )}
                      {latestSubmission.decision && (
                        <p className="mt-2 text-xs font-semibold capitalize text-blue-700">
                          {latestSubmission.decision.replace('_', ' ')}
                        </p>
                      )}
                      {latestSubmission.feedback && (
                        <p className="mt-1 whitespace-pre-line text-xs text-slate-600">
                          {latestSubmission.feedback}
                        </p>
                      )}
                      {latestSubmission.files.map((file) => (
                        <a
                          key={file.id}
                          href={`/api/project-files/${file.id}/download`}
                          className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" /> {file.fileName}
                        </a>
                      ))}
                    </div>
                  )}

                  {isOpen && instanceMilestone && (
                    <div className="space-y-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-3">
                      <textarea
                        rows={4}
                        value={draft.content}
                        onChange={(event) =>
                          updateDraft(instanceMilestone.id, { content: event.target.value })
                        }
                        placeholder="Describe what you completed…"
                        className="w-full rounded-md border border-slate-200 p-3 text-sm"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          value={draft.repoUrl}
                          onChange={(event) =>
                            updateDraft(instanceMilestone.id, { repoUrl: event.target.value })
                          }
                          placeholder="Repository URL"
                        />
                        <Input
                          value={draft.linkUrl}
                          onChange={(event) =>
                            updateDraft(instanceMilestone.id, { linkUrl: event.target.value })
                          }
                          placeholder="Deliverable link"
                        />
                      </div>
                      <Input
                        type="file"
                        multiple
                        onChange={(event) => {
                          for (const file of Array.from(event.target.files ?? [])) {
                            void uploadFile(milestone, file)
                          }
                          event.target.value = ''
                        }}
                      />
                      {draft.files.length > 0 && (
                        <ul className="text-xs text-slate-600">
                          {draft.files.map((file) => (
                            <li key={file.storagePath}>{file.fileName}</li>
                          ))}
                        </ul>
                      )}
                      <div className="flex justify-end">
                        <Button
                          onClick={() => submit(milestone)}
                          disabled={submitting === instanceMilestone.id}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {submitting === instanceMilestone.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Submit milestone
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
      </span>
    )
  }
  if (status === 'submitted') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
        <Loader2 className="h-3.5 w-3.5" /> In review
      </span>
    )
  }
  if (status === 'changes_requested') {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        Changes requested
      </span>
    )
  }
  if (status === 'available') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
        <Circle className="h-3.5 w-3.5" /> Open
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
      <Lock className="h-3.5 w-3.5" /> Locked
    </span>
  )
}
