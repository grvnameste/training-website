'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FolderKanban, Loader2, Play } from 'lucide-react'
import { toast } from 'sonner'

type Project = {
  id: string
  templateTitle: string
  courseTitle: string
  status: string
  progress: number
  totalMilestones: number
  approvedMilestones: number
  currentMilestoneStatus: string | null
}

type Available = {
  id: string
  title: string
  description: string | null
  courseTitle: string
}

export default function StudentProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [available, setAvailable] = useState<Available[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/me/projects', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load projects')
      setProjects(data.projects ?? [])
      setAvailable(data.available ?? [])
    } catch (error: any) {
      toast.error(error?.message || 'Could not load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const start = async (templateId: string) => {
    setStarting(templateId)
    try {
      const res = await fetch('/api/me/projects/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not start project')
      toast.success('Project started')
      router.push(`/student/projects/${data.instance.id}`)
    } catch (error: any) {
      toast.error(error?.message || 'Could not start project')
    } finally {
      setStarting(null)
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
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Project-based learning
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          My projects
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Work through configurable phases and milestones, then submit for review.
        </p>
      </div>

      {projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">In progress</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="rounded-2xl border border-slate-200 bg-white">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {project.courseTitle}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {project.templateTitle}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>
                        {project.approvedMilestones}/{project.totalMilestones} milestones
                      </span>
                      <span className="font-semibold text-slate-700">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-xl bg-slate-900 text-white hover:bg-blue-600"
                    onClick={() => router.push(`/student/projects/${project.id}`)}
                  >
                    Open project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Available projects</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {available.map((template) => (
              <Card key={template.id} className="rounded-2xl border border-slate-200 bg-white">
                <CardContent className="space-y-3 p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {template.courseTitle}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">{template.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{template.description}</p>
                  </div>
                  <Button
                    className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    disabled={starting === template.id}
                    onClick={() => start(template.id)}
                  >
                    {starting === template.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Start project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && available.length === 0 && (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            No projects yet. Published project templates will appear here.
          </p>
        </Card>
      )}
    </div>
  )
}
