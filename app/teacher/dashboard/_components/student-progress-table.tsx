'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Users } from 'lucide-react'
import type { StudentProgressItem } from './types'

interface StudentProgressTableProps {
  rows: StudentProgressItem[]
}

export function StudentProgressTable({ rows }: StudentProgressTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'review' | 'completed'>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter === 'review' && !r.needsReview) return false
      if (statusFilter === 'completed' && r.progressPercent < 100) return false
      if (!q) return true
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q)
      )
    })
  }, [rows, search, statusFilter])

  return (
    <div id="student-progress" className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Learner Progress & Assessment Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Showing {filtered.length} of {rows.length} recent learner records
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {(['all', 'review', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'review' ? 'Needs Review' : 'Completed'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter student or course..."
              className="pl-8 h-8 text-xs bg-white border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pt-2 flex-1">
        {rows.length === 0 ? (
          <div className="py-14 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">No enrolled learners yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once students enroll in a course or start a capstone track, their progress, quiz average, and board links will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center space-y-2">
            <p className="text-sm font-medium text-slate-700">No matching learner records</p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-xs text-slate-500 font-medium h-9">Learner</TableHead>
                <TableHead className="text-xs text-slate-500 font-medium h-9">Course / Track</TableHead>
                <TableHead className="text-xs text-slate-500 font-medium h-9">Progress</TableHead>
                <TableHead className="text-xs text-slate-500 font-medium h-9 text-right">Quiz Avg</TableHead>
                <TableHead className="text-xs text-slate-500 font-medium h-9 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 7).map((row) => (
                <TableRow key={row.id} className="border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                        {row.studentName}
                      </p>
                      {row.studentEmail && (
                        <p className="text-xs text-slate-500 truncate max-w-[160px]">{row.studentEmail}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate max-w-[180px]">
                        {row.courseTitle}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          row.needsReview
                            ? 'text-amber-700 font-medium'
                            : row.progressPercent === 100
                            ? 'text-emerald-700 font-medium'
                            : 'text-slate-500'
                        }`}
                      >
                        {row.statusLabel}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={row.progressPercent}
                        className="h-1.5 flex-1 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-blue-600"
                      />
                      <span className="text-xs font-medium text-slate-700 tabular-nums w-8 text-right">
                        {row.progressPercent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right text-xs font-medium text-slate-800 tabular-nums">
                    {row.quizAverage !== null ? `${row.quizAverage}%` : '—'}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {row.capstoneId ? (
                      <Link
                        href={`/teacher/board/${row.capstoneId}/${row.studentId}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                      >
                        View Board
                      </Link>
                    ) : (
                      <Link
                        href={`/teacher/courses/${row.courseId}/content`}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
                      >
                        Course
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
