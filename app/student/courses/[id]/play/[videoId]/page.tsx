'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ChevronRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  videos: { id: string; name: string; file: string }[]
}

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const videoId = params.videoId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    const allCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const found = allCourses.find((c: Course) => c.id === courseId)
    if (found) {
      setCourse(found)
      const index = found.videos.findIndex((v: any) => v.id === videoId)
      if (index !== -1) setCurrentVideoIndex(index)
    }
  }, [courseId, videoId])

  if (!course) return <div>Loading...</div>

  const currentVideo = course.videos[currentVideoIndex]
  const nextVideo = course.videos[currentVideoIndex + 1]

  return (
    <div className="space-y-6">
      <Link href={`/student/courses/${courseId}`}>
        <Button variant="outline" className="text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Lesson {currentVideoIndex + 1}: {currentVideo?.name}
            </h1>

            {/* Video Container */}
            <div className="w-full aspect-video bg-foreground/10 rounded-lg overflow-hidden">
              {currentVideo?.file ? (
                <video
                  src={currentVideo.file}
                  controls
                  className="w-full h-full"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-foreground/50">Video unavailable</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentVideoIndex + 1) / course.videos.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-foreground/60">
                Lesson {currentVideoIndex + 1} of {course.videos.length}
              </p>
            </div>

            {/* Navigation */}
            {nextVideo && (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setCurrentVideoIndex(currentVideoIndex + 1)
                    router.push(`/student/courses/${courseId}/play/${nextVideo.id}`)
                  }}
                  className="bg-primary hover:bg-primary/90 flex-1"
                >
                  Next Lesson: {nextVideo.name}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Video Playlist */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4 space-y-2 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-3">Course Lessons</h3>
              {course.videos.map((video, index) => (
                <Link
                  key={video.id}
                  href={`/student/courses/${courseId}/play/${video.id}`}
                >
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      index === currentVideoIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">
                      {index + 1}. {video.name}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
