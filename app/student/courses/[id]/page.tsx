'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// fixed imports: include BookOpen and ArrowRight
import { ArrowLeft, ArrowRight, Play, Lock, BookOpen } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  content: string
  videos: { id: string; name: string; file: string }[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const allCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const found = allCourses.find((c: Course) => c.id === courseId)
    setCourse(found)

    const currentUser = JSON.parse(localStorage.getItem('lms_current_user') || '{}')
    const enrollments = JSON.parse(
      localStorage.getItem(`enrollments_${currentUser.email}`) || '[]'
    )
    setIsEnrolled(enrollments.includes(courseId))
  }, [courseId])

  const handleEnroll = () => {
    const currentUser = JSON.parse(localStorage.getItem('lms_current_user') || '{}')
    const enrollments = JSON.parse(
      localStorage.getItem(`enrollments_${currentUser.email}`) || '[]'
    )
    enrollments.push(courseId)
    localStorage.setItem(`enrollments_${currentUser.email}`, JSON.stringify(enrollments))

    const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const courseIndex = courses.findIndex((c: Course) => c.id === courseId)
    if (courseIndex !== -1) {
      courses[courseIndex].enrollments += 1
      localStorage.setItem('lms_courses', JSON.stringify(courses))
    }

    setIsEnrolled(true)
  }

  if (!course) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <Link href="/student/dashboard">
        <Button variant="outline" className="text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full aspect-video bg-primary/10 rounded-lg overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-primary/30" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{course.title}</h1>
            <p className="text-lg text-foreground/70">{course.description}</p>
          </div>

          {course.content && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 whitespace-pre-wrap">{course.content}</p>
              </CardContent>
            </Card>
          )}

          {isEnrolled && course.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Course Lessons</CardTitle>
                <CardDescription>{course.videos.length} videos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.videos.map((video, index) => (
                  <Link key={video.id} href={`/student/courses/${courseId}/play/${video.id}`}>
                    <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-secondary/20 transition cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Lesson {index + 1}: {video.name}</p>
                        <p className="text-sm text-foreground/60">Video lecture</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {!isEnrolled && course.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Course Lessons</CardTitle>
                <CardDescription>{course.videos.length} videos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.videos.map((video, index) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 border border-border rounded-lg opacity-50 cursor-not-allowed">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/50 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Lesson {index + 1}: {video.name}</p>
                      <p className="text-sm text-foreground/60">Enroll to unlock</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">
                ${course.price}
              </CardTitle>
              <CardDescription>
                {course.price === 0 ? 'Free Course' : 'One-time purchase'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 text-primary text-center rounded-lg font-semibold">
                    You're enrolled
                  </div>
                  <Link href="/student/my-courses">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={handleEnroll}
                  className="w-full bg-primary hover:bg-primary/90 text-lg h-11"
                >
                  {course.price === 0 ? 'Enroll Free' : `Enroll Now - $${course.price}`}
                </Button>
              )}

              <div className="space-y-3 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Includes:</p>
                  <ul className="space-y-2 text-sm text-foreground">
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
