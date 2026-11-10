//app/student/result/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { useUser } from "@clerk/nextjs"
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Lock } from 'lucide-react'

type CareerAnswers = Record<string, number>
type CareerOpenAnswers = Record<string, string>
type CultureAnswers = Record<string, number>

type Question = {
  id: string
  text: string
  type: 'likert' | 'open'
}

const likertLabels = [
  'Very confident',
  'Confident',
  'Neutral',
  'Slightly unconfident',
  'Not confident',
]

/* ================= QUESTIONS ================= */
const careerQuestions: Question[] = [
  { id: 'q1', text: 'How comfortable are you with learning new technical tools?', type: 'likert' },
  { id: 'q2', text: 'Which type of tasks energize you most?', type: 'likert' },
  { id: 'q3', text: 'Rate your problem-solving style.', type: 'likert' },
  { id: 'q4', text: 'Which long-term role appeals to you most?', type: 'likert' },
  { id: 'q5', text: 'Describe one technical task you enjoyed recently.', type: 'open' },
  { id: 'q6', text: 'What kind of problems frustrate you most?', type: 'open' },
  { id: 'q7', text: 'List tools/languages you know.', type: 'open' },
  { id: 'q12', text: 'How do you prefer to communicate technical findings?', type: 'likert' },
  { id: 'q13', text: 'How likely are you to automate repetitive work?', type: 'likert' },
  { id: 'q14', text: 'How interested are you in certifications?', type: 'likert' },
]

const cultureQuestions: Question[] = [
  { id: 'c1', text: 'I prefer working independently.', type: 'likert' },
  { id: 'c2', text: 'I like fast-paced environments.', type: 'likert' },
  { id: 'c3', text: 'I seek structured mentorship.', type: 'likert' },
  { id: 'c4', text: 'I prefer stability in work.', type: 'likert' },
]

export default function QuestionnaireResult() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [careerAnswers, setCareerAnswers] = useState<CareerAnswers | null>(null)
  const [careerOpenAnswers, setCareerOpenAnswers] = useState<CareerOpenAnswers | null>(null)
  const [cultureAnswers, setCultureAnswers] = useState<CultureAnswers | null>(null)

  const { user } = useUser()

  useEffect(() => {
    if (!user) return
  
    const load = async () => {
      const { data } = await supabase
        .from('questionnaire_results')
        .select('*')
        .eq('user_id', user.id)   // 🔥 THIS MATCHES DB
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
  
      if (!data) {
        setLoading(false)
        return
      }
  
      setCareerAnswers(data.career_answers)
      setCareerOpenAnswers(data.career_open_answers)
      setCultureAnswers(data.culture_answers)
      setLoading(false)
    }
  
    load()
  }, [user])

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  /* 🔒 NO ASSESSMENT */
  if (!careerAnswers && !careerOpenAnswers && !cultureAnswers) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Lock className="mx-auto w-8 h-8 text-muted-foreground" />
            <CardTitle>Assessment Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/student/questionnaire')}>
              Give Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Your Questionnaire Responses
      </h1>

      {/* ================= CAREER ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Career Assessment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {careerQuestions.map(q => (
            <div key={q.id} className="border rounded-xl p-4 bg-white">
              <p className="font-medium">{q.text}</p>

              {q.type === 'likert' ? (
                <p className="mt-1 text-slate-600">
                  Answer:
                  <span className="ml-2 font-semibold">
                    {careerAnswers?.[q.id] !== undefined
                      ? likertLabels[4 - careerAnswers[q.id]]
                      : '—'}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-slate-600 whitespace-pre-line">
                  {careerOpenAnswers?.[q.id] || '—'}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= CULTURE ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Culture Fit Assessment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {cultureQuestions.map(q => (
            <div key={q.id} className="border rounded-xl p-4 bg-white">
              <p className="font-medium">{q.text}</p>
              <p className="mt-1 text-slate-600">
                Answer:
                <span className="ml-2 font-semibold">
                  {cultureAnswers?.[q.id] !== undefined
                    ? likertLabels[4 - cultureAnswers[q.id]]
                    : '—'}
                </span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
