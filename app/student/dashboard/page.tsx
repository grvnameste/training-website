'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { BookOpen, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  enrollments: number
}

export default function StudentDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)

  useEffect(() => {
    const init = async () => {
      // ✅ AUTH CHECK (Supabase)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      // ❌ Admin ko student dashboard me allow mat karo
      if (session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.replace('/teacher/dashboard')
        return
      }

      // 🧠 Questionnaire flag (abhi demo: false)
      // baad me Supabase table se laa sakte ho
      setQuestionnaireCompleted(false)

      // 📦 Courses (abhi demo empty)
      // later: Supabase `courses` table
      setCourses([])

      setLoading(false)
    }

    init()
  }, [router])

  if (loading) return null

  const filteredCourses = courses.filter(course => {
    if (!questionnaireCompleted) return false

    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q)

    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'free' && course.price === 0) ||
      (priceFilter === 'paid' && course.price > 0)

    return matchesSearch && matchesPrice
  })

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white">
        <p className="text-xs uppercase tracking-widest text-slate-300">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold mt-2">
          Welcome to your learning dashboard
        </h1>
        <p className="text-slate-300 mt-1">
          Track progress and unlock your learning journey
        </p>
      </div>

      {/* 🔒 LOCK CARD */}
      {!questionnaireCompleted && (
        <Card className="rounded-3xl border border-emerald-200 bg-emerald-50">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-emerald-900">
                Let’s get you set up 🚀
              </h2>
              <p className="text-sm text-emerald-800 max-w-xl mt-1">
                Complete the questionnaire to unlock all features, courses,
                and personalised learning paths.
              </p>
            </div>

            <Link href="/student/questionnaire">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6">
                Complete Questionnaire
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="rounded-2xl">
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search courses"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={!questionnaireCompleted}
                className="pl-10"
              />
            </div>

            <select
              disabled={!questionnaireCompleted}
              value={priceFilter}
              onChange={e => setPriceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm"
            >
              <option value="all">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      {!questionnaireCompleted ? (
        <Card className="border-dashed border-2 rounded-3xl">
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              Complete questionnaire to unlock courses
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              This helps us personalize your learning experience
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Link key={course.id} href={`/student/courses/${course.id}`}>
              <Card className="rounded-2xl hover:shadow-lg transition">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>

                <CardContent className="space-y-3 pt-4">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </span>
                    <Button size="sm">Enroll</Button>
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
