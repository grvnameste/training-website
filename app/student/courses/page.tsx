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
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-teal-400/30 border-t-teal-400 animate-spin" />
        <p className="text-sm text-white/60">Loading courses…</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-6 py-12 text-white">
      {/* GRID BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 bg-teal-400/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 bg-cyan-400/20 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0c111a] via-[#0f172a] to-[#0c111a] px-10 py-8 shadow-2xl">
          <p className="text-xs uppercase tracking-widest text-white/40">
            Courses
          </p>
          <h1 className="text-3xl font-semibold mt-2">
            Explore All Courses
          </h1>
          <p className="text-white/60 mt-1">
            Browse learning paths and start building real skills
          </p>
        </div>

        {/* COURSES GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="block h-full"
            >
              <Card className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* THUMBNAIL */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-black/40">
                        <GraduationCap className="w-14 h-14 text-white/30" />
                      </div>
                    )}

                    {/* GRADIENT OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col gap-3 flex-1 bg-black/40">
                    <h3 className="font-semibold text-lg leading-snug line-clamp-2 text-white">
                      {course.title}
                    </h3>

                    <p className="text-sm text-white/60 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="font-semibold text-teal-300">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                      <span className="text-xs text-white/50">
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
    </div>
  )
}
