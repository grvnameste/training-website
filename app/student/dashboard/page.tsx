// app/student/dashboard/page.tsx
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
    <div className="relative min-h-screen px-10 py-16 bg-[#070b12] text-white">
    <div className="relative min-h-screen px-10 py-16 bg-[#070b12] text-white">
      {/* GRID BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-full max-full space-y-10">

        {/* HERO */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-2xl">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold mt-3">
            Welcome to your learning dashboard
          </h1>
          <p className="text-white/60 mt-2">
            Track progress and unlock your learning journey
          </p>
        </div>

        {/* ================= ACTION REQUIRED ================= */}
        {!questionnaireCompleted && (
          <div className="relative rounded-[32px] border border-teal-400/60 bg-[#062b2b] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-teal-400/10 to-cyan-400/10 pointer-events-none" />

            <div className="relative px-12 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-teal-300">
                  Action Required
                </h2>
                <p className="mt-2 text-white/80 max-w-2xl">
                  Complete the questionnaire to unlock courses,
                  capstone projects, and learning features.
                </p>
              </div>

              <Link href="/student/questionnaire">
                <Button className="rounded-full px-10 py-3 bg-teal-400 text-black hover:bg-teal-300 shadow-lg">
                  Complete Questionnaire
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ================= SEARCH ================= */}
        <Card className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  placeholder="Search courses"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={!questionnaireCompleted}
                  className="pl-11 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <select
                disabled={!questionnaireCompleted}
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className="px-5 py-3 rounded-xl border border-white/10 bg-black/30 text-white"
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
          <Card className="rounded-3xl border border-dashed border-white/20 bg-white/5 backdrop-blur shadow-xl">
            <CardContent className="py-24 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Lock className="w-10 h-10 text-white/40" />
              </div>

              <h3 className="text-2xl font-semibold">
                Courses are locked
              </h3>

              <p className="text-white/60 max-w-md mx-auto">
                Complete the questionnaire to unlock your personalized
                learning path and start building real projects.
              </p>

              <Link href="/student/questionnaire">
                <Button className="rounded-full px-12 bg-teal-400 text-black hover:bg-teal-300">
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
