//app/teacher/dashoard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Users,
  Layers,
  CheckCircle,
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

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      setErrorMsg(null)

      // ===== AUTH =====
      const { data: userData, error: userError } =
        await supabase.auth.getUser()

      if (userError || !userData.user) {
        setErrorMsg('User not authenticated')
        setLoading(false)
        return
      }

     
     

      // ===== COURSES (TEACHER) =====
      // ===== COURSES (TEACHER) =====
      const { data: coursesData, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', userData.user.id)
      .eq('is_capstone', false)
      .is('parent_course_id', null)
      .order('created_at', { ascending: false })
    
if (error) {
setErrorMsg(error.message)
setCourses([])
setTotalEnrollments(0)
setLoading(false)
return
}

// set courses
const safeCourses = coursesData ?? []
setCourses(safeCourses)

// ===== DASHBOARD STATS (API - SERVICE ROLE) =====
try {
  const res = await fetch(
    `/api/teacher/dashboard?teacherId=${userData.user.id}`
  )
  

  if (!res.ok) {
    console.error('Stats API failed')
    setTotalStudents(0)
    setTotalEnrollments(0)
  } else {
    const stats = await res.json()
    setTotalStudents(stats.totalStudents)
    setTotalEnrollments(stats.totalEnrollments)
  }
} catch (err) {
  console.error(err)
  setTotalStudents(0)
  setTotalEnrollments(0)
}




      setLoading(false)
    }

    loadDashboardData()
  }, [])

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your dashboard…</p>
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
      <div className="max-w-7xl mx-auto space-y-12 px-4">

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mx-auto space-y-3 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Instructor Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage courses and capstone approvals
          </p>
          <div className="pt-6 border-b" />
        </div>

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Courses */}
          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Courses
                </p>
                <h3 className="text-2xl font-semibold">
                  {courses.length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Students */}
          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Students
                </p>
                <h3 className="text-2xl font-semibold">
                  {totalStudents}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Course Enrollments */}
          <Card>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Course Enrollments
                </p>
                <h3 className="text-2xl font-semibold">
                  {totalEnrollments}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals (unchanged) */}
         
        </div>

        {/* ===== COURSES ===== */}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="hover:shadow-md transition">
                <div className="h-40 bg-muted overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Course Thumbnail
                    </div>
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
