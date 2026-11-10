//app/student/questionnaire/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useUser } from "@clerk/nextjs"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type CareerAnswers = Record<string, number>
type CareerOpenAnswers = Record<string, string>
type CultureAnswers = Record<string, number>

type Question = {
  id: string
  text: string
  type: 'likert' | 'open'
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


  const { user, isLoaded } = useUser()


  /* 🔐 AUTH CHECK (CLERK BASED) */
useEffect(() => {
  if (!isLoaded) return

  if (!user) {
    router.replace('/login')
    return
  }

  setUserId(user.id)   // 👈 Clerk ID
  setLoading(false)
}, [user, isLoaded])

  if (loading) return null

  const activeQuestion =
    step === 'career'
      ? careerQuestions[careerIndex]
      : cultureQuestions[cultureIndex]

  const selectedLikert =
    step === 'career'
      ? careerAnswers[activeQuestion.id]
      : cultureAnswers[activeQuestion.id]

  const nextCareer = () => {
    if (careerIndex < careerQuestions.length - 1) {
      setCareerIndex(i => i + 1)
    } else {
      setStep('culture')
    }
  }

  const finishQuestionnaire = async () => {
    if (!user) return
  
    // 🔥 STEP 1: get UUID from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', user.id)
      .single()
  
    console.log("PROFILE:", profile, profileError)
  
    if (!profile) {
      alert("Profile not found")
      return
    }
  
    // 🔥 STEP 2: insert questionnaire
    const { error } = await supabase
      .from('questionnaire_results')
      .insert({
        user_id: user.id,   // Clerk user id        career_answers: careerAnswers,
        career_open_answers: careerOpenAnswers,
        culture_answers: cultureAnswers,
      })
  
    console.log("INSERT ERROR:", error)
  
    if (error) {
      alert(error.message)   // 🔥 SHOW REAL ERROR
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Card className="rounded-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 'career' ? 'Career Questionnaire' : 'Culture Fit'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <h2 className="text-lg font-semibold">{activeQuestion.text}</h2>

          {activeQuestion.type === 'likert' ? (
            <div className="space-y-3">
              {likertLabels.map((label, i) => {
                const score = 4 - i
                return (
                  <button
                    key={label}
                    onClick={() =>
                      step === 'career'
                        ? setCareerAnswers(p => ({ ...p, [activeQuestion.id]: score }))
                        : setCultureAnswers(p => ({ ...p, [activeQuestion.id]: score }))
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left
                      ${
                        selectedLikert === score
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          ) : (
            <textarea
              rows={5}
              value={careerOpenAnswers[activeQuestion.id] || ''}
              onChange={e =>
                setCareerOpenAnswers(p => ({
                  ...p,
                  [activeQuestion.id]: e.target.value,
                }))
              }
              className="w-full rounded-xl border p-4"
            />
          )}

          <div className="flex justify-end">
            <Button
              onClick={step === 'career' ? nextCareer : nextCulture}
            >
              {step === 'culture' &&
              cultureIndex === cultureQuestions.length - 1
                ? 'Finish'
                : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
