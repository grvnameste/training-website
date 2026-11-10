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
    const currentUser = JSON.parse(
      localStorage.getItem('lms_current_user') || '{}',
    )
    const allCourses = JSON.parse(
      localStorage.getItem('lms_courses') || '[]',
    )
    const enrollmentIds = JSON.parse(
      localStorage.getItem(`enrollments_${currentUser.email}`) || '[]',
    )

    const enrolled = allCourses.filter((c: Course) =>
      enrollmentIds.includes(c.id),
    )
    setEnrolledCourses(enrolled)
  }, [])

  return (
    <div className="space-y-8">
      {/* Header / Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          My Courses
        </h1>
        <p className="text-sm md:text-base text-foreground/70">
          Continue learning from where you left off
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="border-dashed border-2 border-border/70 rounded-3xl">
          <CardContent className="pt-12 pb-12 text-center max-w-xl mx-auto space-y-4">
            <BookOpen className="w-16 h-16 text-foreground/20 mx-auto mb-2" />
            <h3 className="text-xl font-semibold text-foreground">
              You haven't enrolled in any courses yet
            </h3>
            <p className="text-sm md:text-base text-foreground/70">
              Start exploring and enroll in courses to begin your learning
              journey
            </p>
            <Link href="/student/dashboard">
              <Button className="bg-primary hover:bg-primary/90 rounded-full mt-2">
                Explore Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Link key={course.id} href={`/student/courses/${course.id}`}>
              <Card className="overflow-hidden hover:shadow-lg hover:border-primary/50 border border-border/70 transition-all cursor-pointer rounded-2xl flex flex-col h-full">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-primary/5 relative overflow-hidden">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail || '/placeholder.svg'}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                </div>

                <CardContent className="pt-4 pb-4 px-4 md:px-5 space-y-3 flex-1 flex flex-col">
                  <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-foreground/70 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full w-1/3" />
                    </div>
                    <p className="text-[11px] md:text-xs text-foreground/60">
                      33% Complete
                    </p>
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
