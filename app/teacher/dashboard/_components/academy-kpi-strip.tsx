'use client'

import Link from 'next/link'
import { BookOpen, Users, TrendingUp, ClipboardCheck, ArrowUpRight } from 'lucide-react'
import type { DashboardSummary } from './types'

interface AcademyKpiStripProps {
  summary: DashboardSummary
}

export function AcademyKpiStrip({ summary }: AcademyKpiStripProps) {
  const totalReviewsDue = summary.pendingApprovals + summary.pendingCertificates

  const items = [
    {
      label: 'Published Courses',
      value: summary.totalCourses,
      subtext: `${summary.capstoneCourses} with capstone track`,
      icon: BookOpen,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      href: '/teacher/courses',
      actionLabel: 'Catalog',
    },
    {
      label: 'Enrolled Learners',
      value: summary.totalStudents,
      subtext: `${summary.avgQuizScore}% avg quiz score`,
      icon: Users,
      iconColor: 'text-slate-700',
      iconBg: 'bg-slate-100',
      href: '#student-progress',
      actionLabel: 'Directory',
    },
    {
      label: 'Total Enrollments',
      value: summary.totalEnrollments,
      subtext: `${summary.completionRate}% capstone completion`,
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      href: '#courses-overview',
      actionLabel: 'Courses',
    },
    {
      label: 'Pending Reviews',
      value: totalReviewsDue,
      subtext: `${summary.pendingApprovals} stages · ${summary.pendingCertificates} certificates`,
      icon: ClipboardCheck,
      iconColor: totalReviewsDue > 0 ? 'text-amber-600' : 'text-slate-600',
      iconBg: totalReviewsDue > 0 ? 'bg-amber-50' : 'bg-slate-100',
      href: '/teacher/capstone/approvals',
      actionLabel: 'Review Queue',
    },
  ]

  return (
    <section aria-label="Academy key metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{item.label}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {item.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 truncate tabular-nums">{item.subtext}</span>
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5 whitespace-nowrap shrink-0"
              >
                {item.actionLabel}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )
      })}
    </section>
  )
}
