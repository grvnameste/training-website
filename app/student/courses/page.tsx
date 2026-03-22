//app/student/courses/page.tsx
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
      .eq('is_capstone', false)
      .order('created_at', { ascending: false })
      
      setCourses(data || [])
      setLoading(false)
    }

    loadCourses()
  }, [])
// console.log("courses",courses);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading courses…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="rounded-2xl border bg-white px-10 py-8 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Courses
          </p>
          <h1 className="text-3xl font-semibold mt-2">
            Explore All Courses
          </h1>
          <p className="text-slate-600 mt-1">
            Browse learning paths and start building real skills
          </p>
        </div>

        {/* ================= COURSES GRID ================= */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="block h-full"
            >
              <Card className="group h-full overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* THUMBNAIL */}
                  <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <GraduationCap className="w-14 h-14 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h3 className="font-semibold text-lg leading-snug line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="font-semibold text-blue-600">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                      <span className="text-xs text-slate-400">
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
