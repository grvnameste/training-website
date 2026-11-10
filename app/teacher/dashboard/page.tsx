//app/teacher/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"
import {
  Users,
  Layers,
  TrendingUp,
} from 'lucide-react'

import {
  Card,
  CardContent,
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
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalEnrollments, setTotalEnrollments] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()
  const { user, isLoaded } = useUser()

  // ✅ Auth check
  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.replace('/login')
      return
    }
  }, [user, isLoaded])

  // ✅ Fetch courses (FIXED)
  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchCourses = async () => {
      try {
        setLoading(true)

        // 🔥 Clerk → UUID
        const { data: uuid, error: uuidError } = await supabase.rpc('clerk_to_uuid', {
          clerk_id: user.id
        })

        if (uuidError) throw uuidError

        console.log("UUID:", uuid)

        // 🔥 Fetch courses
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', uuid)

        if (error) throw error

        console.log("COURSES:", data)

        setCourses(data || [])
      } catch (err: any) {
        console.error(err)
        setErrorMsg(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user, isLoaded])

  // ✅ Safe returns (AFTER hooks)
  if (!isLoaded) return <div>Loading...</div>
  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your dashboard…</p>
      </div>
    )
  }

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
      <div className="max-w-7xl mx-auto space-y-12 px-4">

        <div className="max-w-3xl mx-auto space-y-3 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Instructor Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage courses and capstone approvals
          </p>
          <div className="pt-6 border-b" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <h3 className="text-2xl font-semibold">{courses.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-xl">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <h3 className="text-2xl font-semibold">{totalStudents}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 flex items-center justify-center rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-muted-foreground">Enrollments</p>
                <h3 className="text-2xl font-semibold">{totalEnrollments}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 flex items-center justify-center rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center space-y-4">
              <BookOpen className="mx-auto w-14 h-14 text-muted-foreground" />
              <p className="text-xl font-semibold">
                You haven’t created any courses yet
              </p>
              <Link href="/teacher/courses/create">
                <Button>
                  <Plus className="mr-2 w-4 h-4" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id}>
                <div className="h-40 bg-muted">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      No Thumbnail
                    </div>
                  )}
                </div>

                <CardContent className="space-y-3 pt-4">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.description || 'No description'}
                  </p>

                  <div className="flex justify-between items-center">
                    <span>₹{course.price}</span>
                    <Link href={`/teacher/courses/${course.id}/edit`}>
                      <Button size="sm">
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