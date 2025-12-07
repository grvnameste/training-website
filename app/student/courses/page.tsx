// app/student/courses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  videos: { id: string; name: string; file: string }[]
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lms_courses') || '[]'
      const parsed = JSON.parse(stored)
      setCourses(parsed)
    } catch (e) {
      console.error('Failed to load courses from localStorage', e)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-foreground/70">Loading courses...</p>
      </div>
    )
  }

  if (!courses.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Courses
            </h1>
            <p className="text-sm text-foreground/60">
              No courses available right now.
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2 border-border/70 rounded-3xl">
          <CardContent className="py-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-foreground/20 mx-auto" />
            <p className="text-sm text-foreground/65 max-w-sm mx-auto">
              Check back soon – new courses will appear here as they are added.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            All Courses
          </h1>
          <p className="text-sm text-foreground/60">
            Browse all available learning paths and video courses.
          </p>
        </div>
        <span className="hidden md:inline-block text-xs text-foreground/60">
          {courses.length} course{courses.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/student/courses/${course.id}`}
            className="block h-full"
          >
            <Card className="group h-full overflow-hidden rounded-2xl border border-border/70 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnail || '/placeholder.svg'}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  {course.videos?.length > 0 && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-black/70 text-white text-xs px-3 py-1 backdrop-blur-sm">
                      {course.videos.length} lesson
                      {course.videos.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm md:text-base">
                      {course.title}
                    </h3>
                    <p className="text-xs md:text-sm text-foreground/65 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-1">
                    <p className="text-sm md:text-base font-semibold text-primary">
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </p>
                    <span className="text-[11px] md:text-xs text-foreground/55">
                      View details →
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
