'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  videos: { id: string; name: string; file: string }[]
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      const { data: result } = await supabase
        .from('questionnaire_results')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)
        .single()

      setQuestionnaireCompleted(!!result)

      try {
        const stored = localStorage.getItem('lms_courses') || '[]'
        setCourses(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load courses', e)
        setCourses([])
      }

      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-white/70">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 py-10 bg-gradient-to-b from-[#0b0f2a] via-[#120c2f] to-background">
      {/* glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-white">All Courses</h1>
          <p className="text-sm text-white/70">
            Browse all available learning paths
          </p>
        </div>

        {/* COURSES GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => {
            const CardUI = (
              <Card className="group h-full overflow-hidden rounded-3xl border bg-background/85 backdrop-blur shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail || '/placeholder.svg'}
                      alt={course.title}
                      className={`w-full h-full object-cover transition duration-300 ${
                        !questionnaireCompleted ? 'blur-[2px]' : 'group-hover:scale-105'
                      }`}
                    />

                    {!questionnaireCompleted && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-4">
                        <Lock className="w-8 h-8 text-white mb-2" />
                        <p className="text-sm font-medium text-white mb-3">
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
                    <h3 className="font-semibold line-clamp-2 text-foreground">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
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
    </div>
  )
}
