'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/* ================= TYPES ================= */

type CareerAnswers = Record<string, number>
type CareerOpenAnswers = Record<string, string>
type CultureAnswers = Record<string, number>

type Question = {
  id: string
  text: string
  type: 'likert' | 'open'
  placeholder?: string
}

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

const likertLabels = [
  'Very confident',
  'Confident',
  'Neutral',
  'Slightly unconfident',
  'Not confident',
]

/* ================= COMPONENT ================= */

export default function StudentQuestionnaire() {
  const router = useRouter()

  const [step, setStep] = useState<'career' | 'culture'>('career')
  const [careerIndex, setCareerIndex] = useState(0)
  const [cultureIndex, setCultureIndex] = useState(0)

  const [careerAnswers, setCareerAnswers] = useState<CareerAnswers>({})
  const [careerOpenAnswers, setCareerOpenAnswers] = useState<CareerOpenAnswers>({})
  const [cultureAnswers, setCultureAnswers] = useState<CultureAnswers>({})

  const [checkingAuth, setCheckingAuth] = useState(true)

  /* 🔐 SUPABASE AUTH CHECK */
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      setCheckingAuth(false)
    }

    checkSession()
  }, [router])

  if (checkingAuth) return null

  /* ================= HANDLERS ================= */

  const onSelectCareer = (val: number) => {
    setCareerAnswers(prev => ({
      ...prev,
      [careerQuestions[careerIndex].id]: val,
    }))
  }

  const onSelectCulture = (val: number) => {
    setCultureAnswers(prev => ({
      ...prev,
      [cultureQuestions[cultureIndex].id]: val,
    }))
  }

  const onOpenChange = (text: string) => {
    setCareerOpenAnswers(prev => ({
      ...prev,
      [careerQuestions[careerIndex].id]: text,
    }))
  }

  const nextCareer = () => {
    if (careerIndex < careerQuestions.length - 1) {
      setCareerIndex(i => i + 1)
    } else {
      setStep('culture')
      setCareerIndex(0)
    }
  }

  const nextCulture = () => {
    if (cultureIndex < cultureQuestions.length - 1) {
      setCultureIndex(i => i + 1)
    } else {
      // ✅ questionnaire completed
      router.replace('/student/dashboard')
    }
  }

  const activeQuestion =
    step === 'career'
      ? careerQuestions[careerIndex]
      : cultureQuestions[cultureIndex]

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'career' ? 'Career Questionnaire' : 'Culture Fit'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <h2 className="text-lg font-semibold">{activeQuestion.text}</h2>

            {activeQuestion.type === 'likert' ? (
              <div className="space-y-3">
                {likertLabels.map((label, i) => (
                  <button
                    key={label}
                    onClick={() =>
                      step === 'career'
                        ? onSelectCareer(i)
                        : onSelectCulture(i)
                    }
                    className="w-full p-3 border rounded-lg text-left hover:bg-slate-100"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={5}
                onChange={e => onOpenChange(e.target.value)}
              />
            )}

            <div className="flex justify-end">
              <Button onClick={step === 'career' ? nextCareer : nextCulture}>
                {step === 'career' ? 'Next' : 'Finish'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
