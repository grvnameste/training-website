'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  FolderKanban,
  PlayCircle,
} from 'lucide-react'
import type { ProjectMetrics } from './types'

export function ProjectPulseCard({ projects }: { projects: ProjectMetrics }) {
  const stats = [
    {
      label: 'Templates',
      value: projects.templates,
      detail: `${projects.publishedTemplates} published`,
      icon: FolderKanban,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active projects',
      value: projects.activeInstances,
      detail: `${projects.completedInstances} completed`,
      icon: PlayCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pending reviews',
      value: projects.pendingReviews,
      detail: projects.pendingReviews > 0 ? 'Awaiting your decision' : 'Queue is clear',
      icon: ClipboardCheck,
      color: projects.pendingReviews > 0 ? 'text-amber-600' : 'text-slate-600',
      bg: projects.pendingReviews > 0 ? 'bg-amber-50' : 'bg-slate-100',
    },
    {
      label: 'Completed',
      value: projects.completedInstances,
      detail: 'All required milestones approved',
      icon: CheckCircle2,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Project delivery</h2>
          <p className="text-xs text-slate-500">
            Template coverage, active student projects, and milestone review load.
          </p>
        </div>
        <Link
          href={projects.nextAction.href}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium ${
            projects.nextAction.tone === 'warning'
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {projects.nextAction.label}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold tabular-nums text-slate-900">{stat.value}</p>
                <p className="text-[10px] text-slate-400">{stat.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
