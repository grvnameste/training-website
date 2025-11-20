'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, BookOpen, Users, Eye } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  enrollments: number
}

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    // Load courses from localStorage
    const savedCourses = localStorage.getItem('lms_courses')
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses))
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">My Courses</h1>
          <p className="text-foreground/70 mt-2">Create and manage your online courses</p>
        </div>
        <Link href="/teacher/courses/create">
          <Button className="bg-primary hover:bg-primary/90 h-11 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {courses.reduce((total, c) => total + c.enrollments, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${courses.reduce((total, c) => total + c.price * c.enrollments, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Your Courses</h2>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
              <p className="text-foreground/70 mb-6">
                Create your first course to start teaching students
              </p>
              <Link href="/teacher/courses/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="w-full h-40 bg-primary/10 relative">
        {course.thumbnail ? (
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary/30" />
          </div>
        )}
      </div>

      <CardContent className="pt-4 space-y-3">
        <div>
          <h3 className="font-bold text-foreground line-clamp-2">{course.title}</h3>
          <p className="text-2xl font-bold text-primary mt-1">${course.price}</p>
        </div>

        <p className="text-sm text-foreground/70 line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-4 text-sm text-foreground/60 pt-2">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {course.enrollments} students
          </div>
        </div>

        <Link href={`/teacher/courses/${course.id}/edit`}>
          <Button className="w-full bg-primary hover:bg-primary/90" size="sm">
            Manage Course
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
