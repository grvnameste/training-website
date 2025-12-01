'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  content: string
  videos: { id: string; name: string; file: string }[]
}

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const found = courses.find((c: Course) => c.id === courseId)
    if (found) setCourse(found)
  }, [courseId])

  if (!course) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <Link href="/teacher/dashboard">
        <Button variant="outline" className="text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Manage Course</h1>
        
        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.thumbnail && (
              <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="w-full max-w-sm h-48 object-cover rounded-lg" />
            )}
            <div>
              <p className="text-sm text-foreground/70">Price</p>
              <p className="text-2xl font-bold text-primary">${course.price}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70 mb-2">Description</p>
              <p className="text-foreground">{course.description}</p>
            </div>
            {course.videos.length > 0 && (
              <div>
                <p className="text-sm text-foreground/70 mb-2">Videos</p>
                <ul className="space-y-2">
                  {course.videos.map((video) => (
                    <li key={video.id} className="text-foreground">
                      • {video.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
