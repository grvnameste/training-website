'use client'

import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart3 } from 'lucide-react'
import type { ActivityPoint } from './types'

interface EnrollmentActivityChartProps {
  data: ActivityPoint[]
}

const chartConfig = {
  enrollments: {
    label: 'Enrollments',
    color: '#2563eb',
  },
  quizzes: {
    label: 'Quiz Attempts',
    color: '#0f766e',
  },
  capstones: {
    label: 'Capstone Updates',
    color: '#4f46e5',
  },
} satisfies ChartConfig

export function EnrollmentActivityChart({ data }: EnrollmentActivityChartProps) {
  const [viewMode, setViewMode] = useState<'enrollments' | 'activity'>('enrollments')

  const totalEnrollments = data.reduce((acc, d) => acc + d.enrollments, 0)
  const totalQuizzes = data.reduce((acc, d) => acc + d.quizzes, 0)
  const totalCapstones = data.reduce((acc, d) => acc + d.capstones, 0)
  const hasAnyData = totalEnrollments > 0 || totalQuizzes > 0 || totalCapstones > 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Learning & Enrollment Activity</h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            6-month trend · {totalEnrollments} enrollments · {totalQuizzes} quiz submissions
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('enrollments')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'enrollments'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Enrollments
          </button>
          <button
            type="button"
            onClick={() => setViewMode('activity')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'activity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quizzes & Capstones
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="pt-6 flex-1 flex flex-col justify-center">
        {!hasAnyData ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center px-4">
            <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">No recorded activity over the past 6 months</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Monthly enrollment counts, quiz completions, and capstone milestones will populate here automatically as students join your courses.
            </p>
          </div>
        ) : viewMode === 'enrollments' ? (
          <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fillEnrollments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="enrollments"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#fillEnrollments)"
                activeDot={{ r: 4, fill: '#2563eb' }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quizzes" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="capstones" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
