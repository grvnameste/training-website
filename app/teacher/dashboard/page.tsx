//app/teacher/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Plus,
  BookOpen,
  Pencil,
  ClipboardCheck,
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your courses…</p>
      </div>
    )
  }

  /* Error */
  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center text-red-500">
            {errorMsg}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto space-y-10 px-4">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">
              Instructor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage courses & capstone approvals
            </p>
          </div>
          </div>

          <div className="flex gap-3">
  {/* Capstone Stage Approvals */}
  <Link href="/teacher/capstone/approvals">
    <Button variant="outline">
      <ClipboardCheck className="w-4 h-4 mr-2" />
      Capstone Approvals
    </Button>
  </Link>

  {/* Trello Access Approvals */}
  <Link href="/teacher/capstone/trello-approvals">
    <Button variant="outline">
      <ClipboardCheck className="w-4 h-4 mr-2" />
      Trello Access
    </Button>
  </Link>

  {/* Create Course */}
  <Link href="/teacher/courses/create">
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create Course
    </Button>
  </Link>
</div>


        {/* ===== EMPTY STATE ===== */}
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center space-y-4">
              <BookOpen className="mx-auto w-14 h-14 text-muted-foreground" />
              <p className="text-xl font-semibold">
                You haven’t created any courses yet
              </p>
              <Link href="/teacher/courses/create">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* ===== COURSE GRID ===== */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="hover:shadow-md transition">
                <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
                  {course.thumbnail_url ? (
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
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold">
                      ₹{course.price}
                    </span>

                    <Link href={`/teacher/courses/${course.id}/edit`}>
                      <Button size="sm" variant="secondary">
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
