'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useUser } from "@clerk/nextjs"

interface Course {
  id: string
  title: string
  price: number
  thumbnail_url: string | null
  description: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])

  const { user, isLoaded } = useUser()

  const [questionnaireCompleted, setQuestionnaireCompleted] =
    useState(false)

  const loadEnrolledCourses = async (userId: string) => {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        course_id,
        courses (
          id,
          title,
          price,
          thumbnail_url,
          description
        )
      `)
      .eq('student_id', userId)

    if (error) {
      console.error('Enroll fetch error', error)
      return
    }

    const courses = data
      ?.map((row: any) => row.courses)
      .filter(Boolean)

    setEnrolledCourses(courses || [])
  }

  useEffect(() => {
    const init = async () => {
      if (!isLoaded || !user) return

      // ✅ STEP 1: create user
      await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          name: user.fullName
        })
      })

      // ✅ STEP 2: direct fetch (NO RETRY, NO WAIT)
      const { data, error } = await supabase
  .from('profiles')
  .select('id')
  .eq('clerk_id', user.id)

if (error || !data || data.length === 0) {
  console.error("PROFILE ERROR:", error)
  setLoading(false)
  return
}

const uuid = data[0].id
console.log("UUID:", uuid)


// ✅ CHECK IF QUESTIONNAIRE COMPLETED
const { data: result } = await supabase
  .from('questionnaire_results')
  .select('id')
  .eq('user_id', user.id)
    .maybeSingle()

console.log("QUESTIONNAIRE RESULT:", result)

// ✅ SET STATE
setQuestionnaireCompleted(!!result)

// ✅ LOAD COURSES
await loadEnrolledCourses(uuid)

// ✅ STOP LOADING
setLoading(false)
    }

    init()
  }, [user, isLoaded])

  if (loading) return null

  return (
    <div className="min-h-screen px-10 py-12 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HERO */}
        <div className="rounded-2xl border bg-white px-10 py-10 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Student Dashboard
          </p>
          <h1 className="text-3xl font-semibold mt-3">
            Welcome to your learning dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Track progress and unlock your learning journey
          </p>
        </div>

        {/* ACTION REQUIRED */}
        {!questionnaireCompleted && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-10 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-blue-700">
                Action Required
              </h2>
              <p className="mt-2 text-slate-700 max-w-2xl">
                Complete the questionnaire to unlock courses,
                capstone projects, and learning features.
              </p>
            </div>

            <Link href="/student/questionnaire">
              <Button className="rounded-full px-10 bg-blue-600 hover:bg-blue-700 text-white">
                Complete Questionnaire
              </Button>
            </Link>
          </div>
        )}

        {/* SEARCH */}
        <Card className="rounded-2xl border bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search courses"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={!questionnaireCompleted}
                  className="pl-11"
                />
              </div>

              <select
                disabled={!questionnaireCompleted}
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className="px-5 py-3 rounded-lg border bg-white text-slate-700"
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ENROLLED COURSES */}
        {questionnaireCompleted && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Your Enrolled Courses
            </h2>

            {enrolledCourses.length === 0 ? (
              <p className="text-slate-500">
                You have not enrolled in any courses yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {enrolledCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="h-40 bg-slate-100 flex items-center justify-center text-slate-400">
                        No image
                      </div>
                    )}

                    <CardContent className="space-y-4 pt-4">
                      <h3 className="font-semibold text-lg">
                        {course.title}
                      </h3>

                      <Button
                        className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          router.push(`/student/courses/${course.id}`)
                        }
                      >
                        Go to Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOCKED */}
        {!questionnaireCompleted && (
          <Card className="rounded-2xl border border-dashed bg-white shadow-sm">
            <CardContent className="py-24 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>

              <h3 className="text-2xl font-semibold">
                Courses are locked
              </h3>

              <p className="text-slate-600 max-w-md mx-auto">
                Complete the questionnaire to unlock your
                personalized learning path.
              </p>

              <Link href="/student/questionnaire">
                <Button className="rounded-full px-12 bg-blue-600 hover:bg-blue-700 text-white">
                  Unlock Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}