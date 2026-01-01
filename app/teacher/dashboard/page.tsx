'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Plus,
  BookOpen,
  Pencil,
} from 'lucide-react'

type Course = {
  id: string
  title: string
  description: string
  price: number
  thumbnail_url: string | null
}

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      setErrorMsg(null)

      const { data: userData, error: userError } =
        await supabase.auth.getUser()

      if (userError || !userData.user) {
        setErrorMsg('User not authenticated')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setErrorMsg(error.message)
        setCourses([])
      } else {
        setCourses(data || [])
      }

      setLoading(false)
    }

    loadCourses()
  }, [])

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <p className="text-blue-700">Loading your courses…</p>
      </div>
    )
  }

  /* Error */
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-blue-100">
          <CardContent className="py-12 text-center text-red-500">
            {errorMsg}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-7xl mx-auto space-y-10 px-4">
        {/* ===== Dashboard Header ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-900">
              Instructor Dashboard
            </h1>
            <p className="text-blue-700/70">
              Manage and edit your courses
            </p>
          </div>

          <Link href="/teacher/courses/create">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* ===== Empty State ===== */}
        {courses.length === 0 ? (
          <Card className="border-blue-100 shadow-sm">
            <CardContent className="py-20 text-center space-y-4">
              <BookOpen className="mx-auto w-14 h-14 text-blue-400" />
              <p className="text-xl font-semibold text-blue-900">
                You haven’t created any courses yet
              </p>
              <p className="text-sm text-blue-700/70 max-w-md mx-auto">
                Start by creating your first course and share your
                knowledge with students.
              </p>

              <Link href="/teacher/courses/create">
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* ===== Course Grid ===== */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card
                key={course.id}
                className="border-blue-100 bg-white shadow-sm hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-blue-100/40 flex items-center justify-center text-blue-700/60 text-sm rounded-t-xl overflow-hidden">
                  {course.thumbnail_url ? (
                    // future: next/image
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    'Course Thumbnail'
                  )}
                </div>

                <CardContent className="space-y-3 pt-4">
                  <h3 className="font-semibold text-lg text-blue-900 line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-sm text-blue-700/70 line-clamp-2">
                    {course.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold text-blue-600">
                      ₹{course.price}
                    </span>

                    <Link
                      href={`/teacher/courses/${course.id}/edit`}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="hover:bg-blue-100"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
