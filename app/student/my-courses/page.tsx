'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, ArrowRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
}

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('lms_current_user') || '{}')
    const allCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const enrollmentIds = JSON.parse(
      localStorage.getItem(`enrollments_${currentUser.email}`) || '[]'
    )

    const enrolled = allCourses.filter((c: Course) => enrollmentIds.includes(c.id))
    setEnrolledCourses(enrolled)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">My Courses</h1>
        <p className="text-foreground/70 mt-2">Continue learning from where you left off</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              You haven't enrolled in any courses yet
            </h3>
            <p className="text-foreground/70 mb-6">
              Start exploring and enroll in courses to begin your learning journey
            </p>
            <Link href="/student/dashboard">
              <Button className="bg-primary hover:bg-primary/90">
                Explore Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <Link key={course.id} href={`/student/courses/${course.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-full h-48 bg-primary/10 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-4 space-y-3">
                  <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                  <p className="text-sm text-foreground/70 line-clamp-2">{course.description}</p>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-1/3"></div>
                  </div>
                  <p className="text-xs text-foreground/60">33% Complete</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
