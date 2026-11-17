'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BookOpen, GraduationCap, LayoutGrid, List, Pencil, Plus, Search, ExternalLink } from 'lucide-react'
import type { DashboardCourse } from './types'

interface CoursesOverviewSectionProps {
  courses: DashboardCourse[]
}

export function CoursesOverviewSection({ courses }: CoursesOverviewSectionProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'capstone' | 'free' | 'paid'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter((c) => {
      if (filter === 'capstone' && !c.hasCapstone) return false
      if (filter === 'free' && c.price > 0) return false
      if (filter === 'paid' && c.price <= 0) return false
      if (!q) return true
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
      )
    })
  }, [courses, search, filter])

  return (
    <section id="courses-overview" className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Academy Courses</h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {filteredCourses.length} of {courses.length} published curriculum tracks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'capstone', 'free', 'paid'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  filter === key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {key === 'all' ? 'All' : key === 'capstone' ? 'With Capstone' : key === 'free' ? 'Free' : 'Paid'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-8 h-9 text-xs bg-white border-slate-200"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {courses.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No courses published yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first course with video lessons and an optional SDLC capstone project board.
          </p>
          <div className="pt-1">
            <Link href="/teacher/courses/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium gap-1.5">
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm font-medium text-slate-700">No courses match your current search or filter</p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setFilter('all')
            }}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-xs text-slate-500 font-medium h-10">Course Title</TableHead>
              <TableHead className="text-xs text-slate-500 font-medium h-10">Format</TableHead>
              <TableHead className="text-xs text-slate-500 font-medium h-10 text-right">Enrolled</TableHead>
              <TableHead className="text-xs text-slate-500 font-medium h-10 text-right">Price</TableHead>
              <TableHead className="text-xs text-slate-500 font-medium h-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id} className="border-slate-100 hover:bg-slate-50/70">
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-8 rounded-md bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/70">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[280px]">{course.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[280px]">
                        {course.subtitle || course.description || 'Curriculum course'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 text-xs text-slate-600">
                  {course.hasCapstone ? 'Lessons · Capstone Project' : 'Self-paced Lessons'}
                </TableCell>
                <TableCell className="py-3.5 text-right text-xs font-medium text-slate-900 tabular-nums">
                  {course.enrolledCount}
                </TableCell>
                <TableCell className="py-3.5 text-right text-xs font-medium text-slate-900 tabular-nums">
                  {course.price > 0 ? `₹${course.price.toLocaleString()}` : 'Free'}
                </TableCell>
                <TableCell className="py-3.5 text-right">
                  <div className="inline-flex items-center justify-end gap-3">
                    <Link
                      href={`/courses/${course.id}`}
                      target="_blank"
                      className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      Preview
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/teacher/courses/${course.id}/content`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Manage
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <GraduationCap className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-slate-500 tabular-nums">
                    {course.hasCapstone ? 'Capstone Track' : 'Standard Course'} · {course.enrolledCount} learners
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {course.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {course.price > 0 ? `₹${course.price.toLocaleString()}` : 'Free'}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/teacher/courses/${course.id}/capstone`}
                    className="text-xs text-slate-500 hover:text-slate-900 whitespace-nowrap"
                  >
                    Capstone
                  </Link>
                  <Link href={`/teacher/courses/${course.id}/content`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                      <Pencil className="w-3.5 h-3.5" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
