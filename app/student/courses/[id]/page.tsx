// app/student/courses/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Play, Lock, BookOpen } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  content: string
  videos: { id: string; name: string; file: string }[]
  // enrollments?: number // (optional, locally used)
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const allCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
      const found = allCourses.find((c: Course) => c.id === courseId) || null
      setCourse(found)

      const currentUser = JSON.parse(
        localStorage.getItem('lms_current_user') || '{}',
      )
      const enrollments: string[] = JSON.parse(
        localStorage.getItem(`enrollments_${currentUser.email}`) || '[]',
      )
      setIsEnrolled(enrollments.includes(courseId))
    } catch (e) {
      console.error('Error loading course detail', e)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  const handleEnroll = () => {
    const currentUser = JSON.parse(
      localStorage.getItem('lms_current_user') || '{}',
    )
    const enrollments: string[] = JSON.parse(
      localStorage.getItem(`enrollments_${currentUser.email}`) || '[]',
    )
    if (!enrollments.includes(courseId)) {
      enrollments.push(courseId)
      localStorage.setItem(
        `enrollments_${currentUser.email}`,
        JSON.stringify(enrollments),
      )
    }

    const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const courseIndex = courses.findIndex((c: Course) => c.id === courseId)
    if (courseIndex !== -1) {
      if (typeof courses[courseIndex].enrollments !== 'number') {
        courses[courseIndex].enrollments = 0
      }
      courses[courseIndex].enrollments += 1
      localStorage.setItem('lms_courses', JSON.stringify(courses))
    }

    setIsEnrolled(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-foreground/70">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Course not found.
        </h1>
        <p className="text-sm text-foreground/60">
          The course you are looking for might have been removed or is
          temporarily unavailable.
        </p>
        <Link href="/student/courses">
          <Button variant="outline" className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/student/courses">
          <Button
            variant="outline"
            className="text-foreground border-border bg-background hover:bg-muted/70 rounded-full px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="hidden md:flex flex-col items-end">
          <p className="text-[11px] text-foreground/50 uppercase tracking-wide">
            Course detail
          </p>
          <p className="text-sm font-medium text-foreground/80 line-clamp-1 max-w-xs text-right">
            {course.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: media + description + lessons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero / Thumbnail */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border/80 bg-slate-900 shadow-md">
            {course.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnail || '/placeholder.svg'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <BookOpen className="w-20 h-20 text-primary/40" />
              </div>
            )}
          </div>

          {/* Title + description */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-snug">
              {course.title}
            </h1>
            <p className="text-sm md:text-base text-foreground/70">
              {course.description}
            </p>
          </div>

          {/* Course Content section (text) */}
          {course.content && (
            <Card className="rounded-2xl border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg text-foreground">
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-foreground/70 whitespace-pre-wrap leading-relaxed">
                  {course.content}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Lessons list (locked / unlocked view) */}
          {course.videos.length > 0 && isEnrolled && (
            <Card className="rounded-2xl border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg text-foreground">
                  Course Lessons
                </CardTitle>
                <CardDescription>
                  {course.videos.length} videos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.videos.map((video, index) => (
                  <Link
                    key={video.id}
                    href={`/student/courses/${courseId}/play/${video.id}`}
                  >
                    <div className="flex items-center gap-4 p-3.5 md:p-4 border border-border rounded-xl hover:bg-muted/70 transition cursor-pointer">
                      <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground fill-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm md:text-base">
                          Lesson {index + 1}: {video.name}
                        </p>
                        <p className="text-xs md:text-sm text-foreground/60">
                          Video lecture
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {course.videos.length > 0 && !isEnrolled && (
            <Card className="rounded-2xl border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg text-foreground">
                  Course Lessons
                </CardTitle>
                <CardDescription>
                  {course.videos.length} videos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-3.5 md:p-4 border border-border rounded-xl opacity-60 cursor-not-allowed bg-muted/40"
                  >
                    <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 bg-primary/60 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm md:text-base">
                        Lesson {index + 1}: {video.name}
                      </p>
                      <p className="text-xs md:text-sm text-foreground/60">
                        Enroll to unlock
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: pricing / enroll card */}
        <div>
          <Card className="sticky top-24 rounded-2xl border border-border/80 shadow-md">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl font-bold text-primary leading-tight">
                ${course.price}
              </CardTitle>
              <CardDescription className="text-sm">
                {course.price === 0 ? 'Free Course' : 'One-time purchase'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 text-primary text-center rounded-lg font-semibold text-sm">
                    You're enrolled
                  </div>
                  <Link href="/student/my-courses">
                    <Button className="w-full bg-primary hover:bg-primary/90 h-11 text-sm md:text-base">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={handleEnroll}
                  className="w-full bg-primary hover:bg-primary/90 text-lg h-11 rounded-xl"
                >
                  {course.price === 0
                    ? 'Enroll Free'
                    : `Enroll Now - $${course.price}`}
                </Button>
              )}

              <div className="space-y-3 pt-4 border-t border-border">
                <div>
                  <p className="text-xs md:text-sm text-foreground/60 mb-1">
                    Includes:
                  </p>
                  <ul className="space-y-1.5 text-xs md:text-sm text-foreground">
                    <li>✓ {course.videos.length} video lessons</li>
                    <li>✓ Lifetime access</li>
                    <li>✓ Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
