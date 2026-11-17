'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUser } from '@/hooks/useUser'
import {
  BookOpen,
  Plus,
  Pencil,
  Search,
  Loader2,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react'

type Course = {
  id: string
  title: string
  subtitle?: string
  description?: string
  price: number
  thumbnail_url: string | null
  is_capstone?: boolean
  created_at?: string
}

export default function TeacherCoursesPage() {
  const { user, isLoaded } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchCourses = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/instructor/courses', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Failed to fetch courses')
        setCourses(
          (data.courses ?? []).map((course: any) => ({
            ...course,
            thumbnail_url: course.thumbnailUrl,
            created_at: course.createdAt,
          }))
        )
      } catch (err) {
        console.error('Failed to fetch teacher courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user, isLoaded])

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Course Catalog Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, edit curriculum modules, and create enterprise learning tracks.
          </p>
        </div>

        <Link href="/teacher/courses/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-sm text-sm">
            <Plus size={16} /> Create New Course
          </Button>
        </Link>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-sm rounded-xl"
          />
        </div>

        <span className="text-xs text-slate-400 self-end sm:self-auto font-medium">
          Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
        </span>
      </div>

      {/* COURSES LIST */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="border border-dashed border-slate-200 bg-white rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No courses found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No courses matched "${searchQuery}". Try a different keyword.`
                : 'You have not authored any courses yet. Get started by publishing your first course!'}
            </p>
          </div>
          <Link href="/teacher/courses/create" className="inline-block">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5">
              <Plus size={14} /> Create Your First Course
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="border border-slate-200 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white flex flex-col group"
            >
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
                    <GraduationCap size={36} className="text-slate-400" />
                    <span className="text-xs font-medium mt-2 text-slate-500">ReadNRevise Course</span>
                  </div>
                )}
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500 tabular-nums">
                    {course.price && course.price > 0 ? `₹${course.price}` : 'Free'} · Curriculum Course
                  </p>
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description || 'No course description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link href={`/courses/${course.id}`} target="_blank" className="text-xs text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1">
                    <ExternalLink size={13} /> View Catalog
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link href={`/teacher/courses/${course.id}/content`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-1 text-slate-700 hover:text-blue-600 border-slate-200">
                        <BookOpen size={13} /> Content
                      </Button>
                    </Link>
                    <Link href={`/teacher/courses/${course.id}/content`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-1 text-slate-700 hover:text-blue-600 border-slate-200">
                        <Pencil size={13} /> Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
