'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  description: string
  thumbnail_url: string | null
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, price, description, thumbnail_url')
        .order('created_at', { ascending: false })

      setCourses(data || [])
      setLoading(false)
    }

    loadCourses()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-white/70">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* ================= HEADER ================= */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0c111a] via-[#0f172a] to-[#0c111a] px-10 py-8 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-white/40">
          Courses
        </p>
        <h1 className="text-3xl font-semibold mt-2 text-white">
          Explore All Courses
        </h1>
        <p className="text-white/60 mt-1">
          Browse all available learning paths and start building skills
        </p>
      </div>

      {/* ================= COURSES GRID ================= */}
      {courses.length === 0 ? (
        <div className="text-center py-24 text-white/60">
          No courses available yet.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="group block h-full"
            >
              <Card
                className="
                  relative h-full overflow-hidden rounded-3xl
                  border border-white/10
                  bg-gradient-to-b from-[#0c111a] to-[#0a0f1a]
                  backdrop-blur
                  shadow-xl
                  transition-all duration-300
                  hover:-translate-y-2 hover:shadow-2xl
                "
              >
                {/* subtle hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-teal-400/10 to-cyan-400/10 pointer-events-none" />

                <CardContent className="relative p-0 flex flex-col h-full">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail_url || '/placeholder.svg'}
                      alt={course.title}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h3 className="font-semibold text-lg leading-snug line-clamp-2 text-white">
                      {course.title}
                    </h3>

                    <p className="text-sm text-white/60 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="font-semibold text-teal-300">
                        {course.price === 0
                          ? 'Free'
                          : `₹${course.price}`}
                      </span>
                      <span className="text-xs text-white/50 group-hover:text-white transition">
                        View details →
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
