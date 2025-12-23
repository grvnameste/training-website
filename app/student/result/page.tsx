'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, Share2, Briefcase, Lock } from 'lucide-react'

type CareerAnswers = Record<string, number>

type PathwayKey =
  | 'Cloud & Infrastructure'
  | 'Business Analysis & Delivery'
  | 'Data & Analytics'
  | 'Automation / Low-Code'
  | 'AI & Workflow Integration'

const pathwayRoadmaps: Record<PathwayKey, string[]> = {
  'Cloud & Infrastructure': [
    'Foundational Concepts',
    'Core Compute & Storage',
    'Networking & Databases',
    'Security & IAM',
    'DevOps Basics',
    'Containers',
    'Infrastructure as Code',
    'Monitoring & Scaling',
    'Serverless',
    'Cost Optimization',
    'High Availability',
    'Disaster Recovery',
    'Architecture Patterns',
    'Mini Project',
    'Certification Prep',
    'Capstone Project',
  ],
  'Business Analysis & Delivery': [],
  'Data & Analytics': [],
  'Automation / Low-Code': [],
  'AI & Workflow Integration': [],
}

function computePathwayFromAnswers(answers: CareerAnswers | null) {
  const keys = Object.keys(pathwayRoadmaps) as PathwayKey[]
  const scores = Object.fromEntries(keys.map(k => [k, 0])) as Record<PathwayKey, number>

  if (!answers) return { top: null, scores }

  Object.values(answers).forEach(v => {
    keys.forEach(k => (scores[k] += v))
  })

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return { top: sorted[0][0] as PathwayKey, scores }
}

export default function QuestionnaireResult() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [top, setTop] = useState<PathwayKey | null>(null)
  const [hasAssessment, setHasAssessment] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        router.replace('/login')
        return
      }

      const { data } = await supabase
        .from('questionnaire_results')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!data) {
        setHasAssessment(false)
        setLoading(false)
        return
      }

      const res = computePathwayFromAnswers(data.career_answers)
      setTop(res.top)
      setHasAssessment(true)
      setLoading(false)
    }

    load()
  }, [router])

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  /* 🔒 NO ASSESSMENT GIVEN */
  if (!hasAssessment) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>
            <CardTitle>Scorecard Locked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Please complete the assessment first to view your personalized
              career scorecard.
            </p>
            <Button
              className="w-full"
              onClick={() => router.push('/student/questionnaire')}
            >
              Give Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!top) return null

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Your Career Compass Results</h1>
            <p className="text-slate-600 mt-2 max-w-xl">
              Based on your assessment, we’ve identified a pathway that aligns
              with your strengths and interests.
            </p>
          </div>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share My Results
          </Button>
        </div>

        {/* ROADMAP */}
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized 16-Week Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pathwayRoadmaps[top].map((w, i) => (
              <div
                key={w}
                className="flex justify-between items-center p-4 border rounded-lg bg-white"
              >
                <span className="font-medium">
                  Week {i + 1}: {w}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
