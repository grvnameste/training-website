//components/courses.tsx
'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

type Course = {
    id: string
    title: string
    subtitle: string
    description: string
    price: number
    thumbnail_url: string
  }
  

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      subtitle,
      description,
      price,
      thumbnail_url
    `)
    .eq('is_capstone', false)
    .is('parent_course_id', null)
    
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCourses(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <p className="text-center text-slate-500">
        Loading courses...
      </p>
    )
  }

  if (courses.length === 0) {
    return (
      <p className="text-center text-slate-500">
        No courses available
      </p>
    )
  }

  return (
    <>
      {/* Back to Home */}
      <div className="mb-6">
        <Link href="/">
          <Button
            variant="ghost"
            className="px-0 text-slate-600 hover:text-slate-900"
          >
            ← Back to Home
          </Button>
        </Link>
      </div>
  
      {/* Courses Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-xl transition"
          >
            {/* Thumbnail */}
            <div className="relative h-44 w-full">
            <Image
  src={course.thumbnail_url || "/default-course.png"}
                alt={course.title}
                fill
                className="object-cover"
              />
  
          
            </div>
  
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">
                  {course.title}
                </CardTitle>
              </div>
  
              <CardDescription className="mt-1 text-sm text-slate-500">
                {course.subtitle}
              </CardDescription>
            </CardHeader>
  
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-slate-600 line-clamp-3">
                {course.description}
              </p>
  
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-blue-600">
                  {course.price === 0 ? 'Free' : `₹${course.price}`}
                </span>
  
                <Link href={`/courses/${course.id}`}>
                  <Button variant="outline" size="sm">
                    View Course
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
  
}
