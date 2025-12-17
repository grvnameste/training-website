'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  videos: { id: string; name: string; file: string }[]
}

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)

  useEffect(() => {
    const user = safeParse(localStorage.getItem('lms_current_user'))
    if (user?.email) {
      const q = localStorage.getItem(`questionnaire_${user.email}`)
      setQuestionnaireCompleted(!!q)
    }

    try {
      const stored = localStorage.getItem('lms_courses') || '[]'
      setCourses(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to load courses', e)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-foreground/70">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">All Courses</h1>
        <p className="text-sm text-muted-foreground">
          Browse all available learning paths
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const CardUI = (
            <Card className="group h-full overflow-hidden rounded-2xl border border-border/70 shadow-sm transition-all">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnail || '/placeholder.svg'}
                    alt={course.title}
                    className={`w-full h-full object-cover ${
                      !questionnaireCompleted ? 'blur-[1.5px]' : ''
                    }`}
                  />

                  {!questionnaireCompleted && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
                      <Lock className="w-8 h-8 text-white mb-2" />
                      <p className="text-sm font-medium text-white mb-2">
                        Complete your assessment to enroll
                      </p>
                      <Button size="sm" variant="secondary" asChild>
                        <Link href="/student/questionnaire">
                          Complete Assessment
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="font-semibold line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {questionnaireCompleted ? 'View details →' : 'Locked'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )

          return questionnaireCompleted ? (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="block h-full"
            >
              {CardUI}
            </Link>
          ) : (
            <div key={course.id} className="h-full">
              {CardUI}
            </div>
          )
        })}
      </div>
    </div>
  )
}
