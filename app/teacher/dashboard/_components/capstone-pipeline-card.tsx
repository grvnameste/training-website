'use client'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { ArrowRight } from 'lucide-react'
import type { CapstonePipeline } from './types'

interface CapstonePipelineCardProps {
  pipeline: CapstonePipeline
}

export function CapstonePipelineCard({ pipeline }: CapstonePipelineCardProps) {
  const denom = Math.max(pipeline.total, 1)

  const stages = [
    {
      label: 'Stage 1 · Requirements Awaiting Review',
      count: pipeline.stage1Pending,
      pct: Math.round((pipeline.stage1Pending / denom) * 100),
      indicatorClass: '[&>[data-slot=progress-indicator]]:bg-amber-500',
    },
    {
      label: 'Stage 2 · Kanban Boards Awaiting Review',
      count: pipeline.stage2Pending,
      pct: Math.round((pipeline.stage2Pending / denom) * 100),
      indicatorClass: '[&>[data-slot=progress-indicator]]:bg-blue-600',
    },
    {
      label: 'Stage 3 · Final Delivery Awaiting Review',
      count: pipeline.stage3Pending,
      pct: Math.round((pipeline.stage3Pending / denom) * 100),
      indicatorClass: '[&>[data-slot=progress-indicator]]:bg-indigo-600',
    },
    {
      label: 'Completed Capstone Tracks',
      count: pipeline.completed,
      pct: Math.round((pipeline.completed / denom) * 100),
      indicatorClass: '[&>[data-slot=progress-indicator]]:bg-emerald-600',
    },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full">
      <div className="space-y-1 pb-5 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">Capstone & Certification Pipeline</h2>
        <p className="text-xs text-slate-500 tabular-nums">
          {pipeline.total} active capstone learners · {pipeline.certificatesIssued} certificates issued
        </p>
      </div>

      <div className="py-5 space-y-5 flex-1 flex flex-col justify-center">
        {stages.map((stage) => (
          <div key={stage.label} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 truncate pr-2">{stage.label}</span>
              <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                {stage.count} {pipeline.total > 0 ? `(${stage.pct}%)` : ''}
              </span>
            </div>
            <Progress
              value={pipeline.total > 0 ? stage.pct : 0}
              className={`h-2 bg-slate-100 ${stage.indicatorClass}`}
            />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <Link
          href="/teacher/capstone/approvals"
          className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
        >
          Open Capstone Approvals
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/teacher/certificates"
          className="font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 tabular-nums"
        >
          Certificates ({pipeline.certificatesPending} due)
        </Link>
      </div>
    </div>
  )
}
