
//app/student/questionnarie/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CareerAnswers = Record<string, number>
type CareerOpenAnswers = Record<string, string>
type CultureAnswers = Record<string, number>

type Question = {
  id: string
  text: string
  type: 'likert' | 'open'
}

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

export default function StudentQuestionnaire() {
  const router = useRouter()

  const [step, setStep] = useState<'career' | 'culture'>('career')
  const [careerIndex, setCareerIndex] = useState(0)
  const [cultureIndex, setCultureIndex] = useState(0)

  const [careerAnswers, setCareerAnswers] = useState<CareerAnswers>({})
  const [careerOpenAnswers, setCareerOpenAnswers] = useState<CareerOpenAnswers>({})
  const [cultureAnswers, setCultureAnswers] = useState<CultureAnswers>({})

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
        return
      }
      setUserId(data.user.id)
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return null

  const onSelectCareer = (val: number) => {
    setCareerAnswers(p => ({ ...p, [careerQuestions[careerIndex].id]: val }))
  }

  const onSelectCulture = (val: number) => {
    setCultureAnswers(p => ({ ...p, [cultureQuestions[cultureIndex].id]: val }))
  }

  const onOpenChange = (text: string) => {
    setCareerOpenAnswers(p => ({
      ...p,
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

  const finishQuestionnaire = async () => {
    if (!userId) return

    const { error } = await supabase.from('questionnaire_results').insert({
      user_id: userId,
      career_answers: careerAnswers,
      career_open_answers: careerOpenAnswers,
      culture_answers: cultureAnswers,
    })

    if (error) {
      console.error(error)
      alert('Failed to save questionnaire')
      return
    }

    router.replace('/student/result')
  }

  const nextCulture = () => {
    if (cultureIndex < cultureQuestions.length - 1) {
      setCultureIndex(i => i + 1)
    } else {
      finishQuestionnaire()
    }
  }

  const activeQuestion =
    step === 'career'
      ? careerQuestions[careerIndex]
      : cultureQuestions[cultureIndex]

  const selectedLikert =
    step === 'career'
      ? careerAnswers[careerQuestions[careerIndex]?.id]
      : cultureAnswers[cultureQuestions[cultureIndex]?.id]

  const isLastCulture =
    step === 'culture' && cultureIndex === cultureQuestions.length - 1

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
                    type="button"
                    onClick={() =>
                      step === 'career'
                        ? onSelectCareer(i)
                        : onSelectCulture(i)
                    }
                    className={`w-full p-3 border rounded-lg text-left
                      ${selectedLikert === i
                        ? 'bg-slate-200 border-slate-400'
                        : 'hover:bg-slate-100'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={5}
                value={careerOpenAnswers[careerQuestions[careerIndex]?.id] || ''}
                onChange={e => onOpenChange(e.target.value)}
              />
            )}

            <div className="flex justify-end">
              <Button onClick={step === 'career' ? nextCareer : nextCulture}>
                {step === 'career' ? 'Next' : isLastCulture ? 'Finish' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
