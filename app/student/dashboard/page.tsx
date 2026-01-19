'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Lock } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [questionnaireCompleted, setQuestionnaireCompleted] =
    useState(false)

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      if (
        session.user.email ===
        process.env.NEXT_PUBLIC_ADMIN_EMAIL
      ) {
        router.replace('/teacher/dashboard')
        return
      }

      const { data } = await supabase
        .from('questionnaire_results')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)
        .single()

      setQuestionnaireCompleted(!!data)
      setLoading(false)
    }

    init()
  }, [router])

  if (loading) return null

  return (
    <div className="min-h-screen px-10 py-12 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ================= HERO ================= */}
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

        {/* ================= ACTION REQUIRED ================= */}
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

        {/* ================= SEARCH ================= */}
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

        {/* ================= LOCKED STATE ================= */}
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
