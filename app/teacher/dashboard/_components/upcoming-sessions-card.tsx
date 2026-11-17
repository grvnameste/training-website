'use client'

import Link from 'next/link'
import { Calendar, ExternalLink, ArrowRight } from 'lucide-react'
import type { UpcomingMeeting } from './types'

interface UpcomingSessionsCardProps {
  meetings: UpcomingMeeting[]
  pendingApprovals: number
  pendingCertificates: number
}

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Scheduled'
  }
}

export function UpcomingSessionsCard({
  meetings,
  pendingApprovals,
  pendingCertificates,
}: UpcomingSessionsCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Mentor Sessions & Action Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {meetings.length} scheduled reviews · {pendingApprovals + pendingCertificates} pending actions
          </p>
        </div>
        <Link
          href="/teacher/capstone/approvals"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
        >
          Manage
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {meetings.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Calendar className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">No upcoming capstone meetings</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Schedule 1-on-1 review sessions directly from the Capstone Approvals queue when students submit milestones.
            </p>
          </div>
        ) : (
          meetings.slice(0, 5).map((m) => (
            <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-slate-900 truncate">{m.studentName}</p>
                <p className="text-xs text-slate-500 truncate">
                  {m.capstoneTitle} · <span className="tabular-nums">{formatDateTime(m.scheduledAt)}</span>
                </p>
              </div>
              {m.meetingLink ? (
                <a
                  href={m.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Join
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <Link
                  href="/teacher/capstone/approvals"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
                >
                  Review
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
        <Link
          href="/teacher/capstone/approvals"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-medium text-slate-800"
        >
          <span className="truncate">Stage Reviews ({pendingApprovals})</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </Link>
        <Link
          href="/teacher/certificates"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-medium text-slate-800"
        >
          <span className="truncate">Certificates ({pendingCertificates})</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </Link>
      </div>
    </div>
  )
}
