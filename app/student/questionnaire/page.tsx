'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CareerAnswers = Record<string, number>
type CareerOpenAnswers = Record<string, string>
type CultureAnswers = Record<string, number>

type Question = {
  id: string
  text: string
  type: 'likert' | 'open'
  placeholder?: string
}

/* --- questions omitted for brevity in this comment block, keep your original arrays --- */
/* Copy the same careerQuestions and cultureQuestions you already have above here. */
const careerQuestions: Question[] = [
  { id: 'q1', text: 'How comfortable are you with learning new technical tools (e.g., a new programming language, cloud console, or BI tool)?', type: 'likert' },
  { id: 'q2', text: 'Which type of tasks energize you most? (Choose the option that fits best)', type: 'likert' },
  { id: 'q3', text: 'Rate your problem-solving style (from step-by-step to open puzzles).', type: 'likert' },
  { id: 'q4', text: 'Which long-term role appeals to you most? (technical infra / BA / Data / Automation / AI)', type: 'likert' },

  { id: 'q5', text: 'Describe one technical task you enjoyed recently. What did you like about it?', type: 'open', placeholder: 'e.g., built a small script to automate Excel tasks — I enjoyed the logic and quick results.' },
  { id: 'q6', text: 'What kinds of problems at work or school frustrate you most?', type: 'open', placeholder: 'e.g., unclear requirements, missing data, repetitive manual tasks...' },
  { id: 'q7', text: 'List up to three tools/languages/platforms you are familiar with and your level (beginner/intermediate/advanced).', type: 'open', placeholder: 'e.g., Excel - advanced; Python - beginner; AWS - beginner' },
  { id: 'q8', text: 'If you had to pick a role today to enjoy for the next 2 years, what would it be and why?', type: 'open', placeholder: 'Short paragraph — what role and why.' },
  { id: 'q9', text: 'Which industries or domains interest you most and why? (e.g., healthcare, fintech, education)', type: 'open', placeholder: 'List industries and one-line reason each.' },
  { id: 'q10', text: 'How important is job-market fit in Australia to you? Are you open to certifications or relocation?', type: 'open', placeholder: 'e.g., Open to certs, prefer remote, willing to relocate...' },
  { id: 'q11', text: 'Describe one transferable skill you have (communication, documentation, stakeholder management) with an example.', type: 'open', placeholder: 'e.g., wrote documentation that saved time...' },

  { id: 'q12', text: 'How do you prefer to communicate technical findings (document only / present / coach)?', type: 'likert' },
  { id: 'q13', text: 'When given a repetitive manual process, how likely are you to automate it?', type: 'likert' },
  { id: 'q14', text: 'How interested are you in roles that require formal certifications (cloud/analytics)?', type: 'likert' },
  { id: 'q15', text: 'How flexible are you when learning something outside your comfort zone?', type: 'likert' },
]

const cultureQuestions: Question[] = [
  { id: 'c1', text: 'I prefer working independently rather than in a large team.', type: 'likert' },
  { id: 'c2', text: 'I like fast-paced environments with frequent changes.', type: 'likert' },
  { id: 'c3', text: 'I seek strong mentorship and structured training initially.', type: 'likert' },
  { id: 'c4', text: 'I prefer roles with clear procedures and stability.', type: 'likert' },
  { id: 'c5', text: 'I am comfortable presenting technical ideas to non-technical stakeholders.', type: 'likert' },
  { id: 'c6', text: 'I like experimentation and trying new technologies even if they fail initially.', type: 'likert' },
]

type PathwayKey =
  | 'Cloud & Infrastructure'
  | 'Business Analysis & Delivery'
  | 'Data & Analytics'
  | 'Automation / Low-Code'
  | 'AI & Workflow Integration'

const pathwayKeys: PathwayKey[] = [
  'Cloud & Infrastructure',
  'Business Analysis & Delivery',
  'Data & Analytics',
  'Automation / Low-Code',
  'AI & Workflow Integration',
]

// keep your weights exactly as before
const careerQuestionWeights: Record<string, number[]> = {
  q1: [0.6, 0.2, 0.2, 0.2, 0.4],
  q2: [1.0, 0, 0, 0.1, 0.2],
  q3: [0.4, 0.2, 0.6, 0.2, 0.4],
  q4: [0.6, 0.8, 0.5, 0.6, 0.6],
  q12: [0.1, 0.9, 0.4, 0.3, 0.4],
  q13: [0.2, 0.2, 0.2, 1.0, 0.4],
  q14: [0.4, 0.4, 0.4, 0.4, 0.6],
  q15: [0.4, 0.6, 0.6, 0.6, 0.6],
}

export default function StudentQuestionnaire() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [step, setStep] = useState<'career' | 'culture'>('career') // remove 'results' usage
  const [careerIndex, setCareerIndex] = useState(0)
  const [cultureIndex, setCultureIndex] = useState(0)

  const [careerAnswers, setCareerAnswers] = useState<CareerAnswers>(() =>
    careerQuestions.filter(q => q.type === 'likert').reduce((acc, q) => ({ ...acc, [q.id]: 2 }), {} as CareerAnswers)
  )

  const [careerOpenAnswers, setCareerOpenAnswers] = useState<CareerOpenAnswers>(() =>
    careerQuestions.filter(q => q.type === 'open').reduce((acc, q) => ({ ...acc, [q.id]: '' }), {} as CareerOpenAnswers)
  )

  const [cultureAnswers, setCultureAnswers] = useState<CultureAnswers>(() =>
    cultureQuestions.reduce((acc, q) => ({ ...acc, [q.id]: 2 }), {} as CultureAnswers)
  )

  const [computedPathway, setComputedPathway] = useState<PathwayKey | null>(null)
  const [pathwayScores, setPathwayScores] = useState<Record<PathwayKey, number> | null>(null)

  useEffect(() => {
    const u = (() => {
      try {
        return JSON.parse(localStorage.getItem('lms_current_user') || 'null')
      } catch {
        return null
      }
    })()
    if (!u) {
      router.push('/login')
      return
    }
    setCurrentUser(u)

    // if saved career, go to the dedicated result page
    const c = localStorage.getItem(`questionnaire_career_${u.email}`)
    if (c) {
      try {
        const parsed = JSON.parse(c)
        if (parsed.answers) setCareerAnswers(parsed.answers)
        if (parsed.openAnswers) setCareerOpenAnswers(parsed.openAnswers)
        const { top, scores } = computePathwayFromAnswers(parsed.answers || careerAnswers)
        setComputedPathway(top)
        setPathwayScores(scores)
        router.push('/student/rersult') // navigate away immediately if already computed
      } catch (e) {
        // ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  function computePathwayFromAnswers(answersObj: CareerAnswers | Record<string, number> | undefined) {
    const scores: Record<PathwayKey, number> = {
      'Cloud & Infrastructure': 0,
      'Business Analysis & Delivery': 0,
      'Data & Analytics': 0,
      'Automation / Low-Code': 0,
      'AI & Workflow Integration': 0,
    }
    if (!answersObj) return { top: null, scores }
    for (const q of Object.keys(answersObj)) {
      const val = Number(answersObj[q] ?? 0)
      const weights = careerQuestionWeights[q] || [0, 0, 0, 0, 0]
      pathwayKeys.forEach((pKey, idx) => {
        scores[pKey] += (weights[idx] || 0) * val
      })
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const top = (sorted.length ? (sorted[0][0] as PathwayKey) : null)
    return { top, scores }
  }

  const likertLabels = [
    'Very confident',
    'Confident',
    'Neutral',
    'Slightly unconfident',
    'Not confident at all',
  ]

  const careerProgress = Math.round(((careerIndex + 1) / careerQuestions.length) * 100)
  const cultureProgress = Math.round(((cultureIndex + 1) / cultureQuestions.length) * 100)
  const progress = step === 'career' ? careerProgress : cultureProgress

  const onSelectCareerOption = (val: number) => {
    const q = careerQuestions[careerIndex]
    if (q.type !== 'likert') return
    setCareerAnswers(prev => ({ ...prev, [q.id]: val }))
  }

  const onChangeCareerOpen = (text: string) => {
    const q = careerQuestions[careerIndex]
    if (q.type !== 'open') return
    setCareerOpenAnswers(prev => ({ ...prev, [q.id]: text }))
  }

  const onSelectCultureOption = (val: number) => {
    const q = cultureQuestions[cultureIndex]
    setCultureAnswers(prev => ({ ...prev, [q.id]: val }))
  }

  const goCareerNext = () => {
    // if open question, allow empty - user can leave blank
    if (careerIndex < careerQuestions.length - 1) {
      setCareerIndex(i => i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // finalise career answers and move to culture
    const { top, scores } = computePathwayFromAnswers(careerAnswers)
    setComputedPathway(top)
    setPathwayScores(scores)
    if (currentUser?.email) {
      localStorage.setItem(`questionnaire_career_${currentUser.email}`, JSON.stringify({
        answers: careerAnswers,
        openAnswers: careerOpenAnswers,
        computedAt: new Date().toISOString(),
        computedTop: top,
        scores,
      }))
    }
    setStep('culture')
    setCareerIndex(0)
  }

  const goCareerPrev = () => {
    if (careerIndex > 0) setCareerIndex(i => i - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goCultureNext = () => {
    if (cultureIndex < cultureQuestions.length - 1) {
      setCultureIndex(i => i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // finalise culture answers and then navigate to the dedicated result page
    if (currentUser?.email) {
      localStorage.setItem(`questionnaire_culture_${currentUser.email}`, JSON.stringify({
        answers: cultureAnswers,
        submittedAt: new Date().toISOString(),
      }))
      localStorage.setItem(`questionnaire_${currentUser.email}`, JSON.stringify({ careerAt: new Date().toISOString() }))
    }

    // compute pathway again to ensure result page sees the computed values in localStorage
    const { top, scores } = computePathwayFromAnswers(careerAnswers)
    setComputedPathway(top)
    setPathwayScores(scores)
    // ensure career entry is saved (in case user skipped career finalise earlier)
    if (currentUser?.email) {
      localStorage.setItem(`questionnaire_career_${currentUser.email}`, JSON.stringify({
        answers: careerAnswers,
        openAnswers: careerOpenAnswers,
        computedAt: new Date().toISOString(),
        computedTop: top,
        scores,
      }))
    }

    // NAVIGATE to the dedicated result page (this is the key change)
    router.push('/student/rersult')
  }

  const goCulturePrev = () => {
    if (cultureIndex > 0) setCultureIndex(i => i - 1)
    else setStep('career')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const retakeAll = () => {
    if (!currentUser?.email) return
    localStorage.removeItem(`questionnaire_career_${currentUser.email}`)
    localStorage.removeItem(`questionnaire_culture_${currentUser.email}`)
    localStorage.removeItem(`questionnaire_${currentUser.email}`)
    setCareerAnswers(careerQuestions.filter(q => q.type === 'likert').reduce((acc, q) => ({ ...acc, [q.id]: 2 }), {} as CareerAnswers))
    setCareerOpenAnswers(careerQuestions.filter(q => q.type === 'open').reduce((acc, q) => ({ ...acc, [q.id]: '' }), {} as CareerOpenAnswers))
    setCultureAnswers(cultureQuestions.reduce((acc, q) => ({ ...acc, [q.id]: 2 }), {} as CultureAnswers))
    setComputedPathway(null)
    setPathwayScores(null)
    setStep('career')
    setCareerIndex(0)
    setCultureIndex(0)
  }

  const renderOpenQuestion = (q: Question) => {
    const val = careerOpenAnswers[q.id] ?? ''
    const maxLen = 400
    return (
      <div className="w-full md:w-3/4 mx-auto">
        <textarea
          value={val}
          onChange={(e) => onChangeCareerOpen(e.target.value)}
          placeholder={q.placeholder || ''}
          maxLength={maxLen}
          rows={6}
          className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-foreground shadow-sm"
        />
        <div className="text-sm text-foreground/60 mt-2 text-right">{val.length}/{maxLen}</div>
      </div>
    )
  }

  const OptionRow: React.FC<{
    label: string
    selected: boolean
    onClick: () => void
  }> = ({ label, selected, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left flex items-center gap-4 p-4 rounded-lg border transition-shadow
          ${selected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:shadow-sm'}`}
        aria-pressed={selected}
        type="button"
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
          {selected ? <div className="w-2.5 h-2.5 rounded-full bg-white" /> : <div className="w-2.5 h-2.5 rounded-full bg-white/0" />}
        </div>
        <div className="text-sm text-foreground/800">{label}</div>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Career Strengths Diagnostic</CardTitle>
              <div className="text-sm text-foreground/60">{step === 'career' ? `${careerIndex + 1}/${careerQuestions.length}` : `${cultureIndex + 1}/${cultureQuestions.length}`}</div>
            </div>
          </CardHeader>

          <div className="mb-6">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <CardContent className="p-0">
            {/* CAREER */}
            {step === 'career' && (
              <>
                <div className="text-center mb-6">
                  <div className="text-sm text-foreground/60 mb-2">Question {careerIndex + 1} of {careerQuestions.length}</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground/900 leading-snug">{careerQuestions[careerIndex].text}</h2>
                </div>

                <div className="space-y-4">
                  {careerQuestions[careerIndex].type === 'likert' ? (
                    <div className="space-y-3">
                      {likertLabels.map((lab, i) => {
                        const id = careerQuestions[careerIndex].id
                        const selected = (careerAnswers[id] ?? 2) === i
                        return (
                          <OptionRow key={lab} label={lab} selected={selected} onClick={() => onSelectCareerOption(i)} />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="pt-2">{renderOpenQuestion(careerQuestions[careerIndex])}</div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-10">
                  <button onClick={goCareerPrev} className="px-4 py-2 rounded-md border bg-white text-foreground/700">← Back</button>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-foreground/60">Progress: {progress}%</div>
                    <button onClick={goCareerNext} className="px-5 py-3 rounded-md bg-blue-600 text-white font-medium">
                      {careerIndex < careerQuestions.length - 1 ? 'Next' : 'Continue'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* CULTURE */}
            {step === 'culture' && (
              <>
                <div className="text-center mb-6">
                  <div className="text-sm text-foreground/60 mb-2">Culture question {cultureIndex + 1} of {cultureQuestions.length}</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground/900 leading-snug">{cultureQuestions[cultureIndex].text}</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    {likertLabels.map((lab, i) => {
                      const selected = (cultureAnswers[cultureQuestions[cultureIndex].id] ?? 2) === i
                      return (
                        <OptionRow key={lab} label={lab} selected={selected} onClick={() => onSelectCultureOption(i)} />
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-10">
                  <button onClick={goCulturePrev} className="px-4 py-2 rounded-md border bg-white text-foreground/700">← Back</button>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-foreground/60">Progress: {progress}%</div>
                    <button onClick={goCultureNext} className="px-5 py-3 rounded-md bg-blue-600 text-white font-medium">
                      {cultureIndex < cultureQuestions.length - 1 ? 'Next' : 'Finish'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
