'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type CareerAnswers = Record<string, number> // likert answers (0..4)
type CareerOpenAnswers = Record<string, string> // open text answers
type CultureAnswers = Record<string, number>

type Question = {
  id: string
  text: string
  type: 'likert' | 'open'
  // optional hint / placeholder for open questions
  placeholder?: string
}

const CAREER_SCREENSHOT_REF = '/mnt/data/cf976832-d05d-4ea2-a6ff-6058b5ddfb94.png'

/**
 * Mixed questions list (15 total):
 * First 4 = Likert, Next 7 = Open, Last 4 = Likert
 */
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

type PathwayKey = 'Cloud & Infrastructure' | 'Business Analysis & Delivery' | 'Data & Analytics' | 'Automation / Low-Code' | 'AI & Workflow Integration'
const pathwayKeys: PathwayKey[] = [
  'Cloud & Infrastructure',
  'Business Analysis & Delivery',
  'Data & Analytics',
  'Automation / Low-Code',
  'AI & Workflow Integration',
]

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

const pathwayRoadmaps: Record<PathwayKey, { title: string; steps: string[] }> = {
  'Cloud & Infrastructure': {
    title: 'Cloud & Infrastructure — Starter Roadmap',
    steps: [
      'Basics: Learn Linux fundamentals, networking basics (TCP/IP), and command-line usage.',
      'Cloud intro: Get familiar with one provider (AWS/Azure/GCP) — understand VM, storage, IAM, and networking.',
      'Hands-on: Deploy a sample app (static website or simple Node app) to cloud VM or managed service.',
      'Automation: Learn Infrastructure-as-Code tools — Terraform or CloudFormation basics.',
      'Certify: Consider entry cert like AWS Certified Cloud Practitioner or equivalent.',
      'Next: Learn containerization (Docker) and orchestration (Kubernetes) fundamentals.',
    ],
  },
  'Business Analysis & Delivery': {
    title: 'Business Analysis & Delivery — Starter Roadmap',
    steps: [
      'Foundations: Learn requirement gathering, writing user stories, and process mapping.',
      'Tools: Get comfortable with Excel/Sheets, basic SQL, and documentation tools (Confluence/Notion).',
      'Communication: Practice stakeholder interviews and presenting findings clearly.',
      'Delivery: Learn Agile basics (Scrum/Kanban) and tools like Jira.',
      'Portfolio: Document 2–3 case studies where you analyzed a problem and proposed a solution.',
      'Next: Explore product analytics tools (Mixpanel/GA) and basic data literacy to strengthen decision-making.',
    ],
  },
  'Data & Analytics': {
    title: 'Data & Analytics — Starter Roadmap',
    steps: [
      'Foundations: Learn statistics basics (mean, median, variance), and Excel/Sheets for analysis.',
      'SQL: Learn SQL for querying relational data (SELECT, JOIN, GROUP BY).',
      'Python/R: Pick Python (pandas, numpy) for data cleaning and exploration.',
      'Visualization: Learn a charting library or BI tool (PowerBI/Tableau/Looker).',
      'Project: Do a small end-to-end analysis — get a dataset, clean it, analyze, and visualize insights.',
      'Next: Learn basic machine learning concepts and pipelines as needed.',
    ],
  },
  'Automation / Low-Code': {
    title: 'Automation / Low-Code — Starter Roadmap',
    steps: [
      'Basics: Document repetitive processes you want to automate; learn logic constructs (if/else, loops).',
      'Tools: Explore low-code platforms (Power Automate, Make, Zapier) and their building blocks.',
      'Scripting: Learn a small amount of scripting (JavaScript/Python) to extend automations.',
      'Integrations: Practice connecting APIs and services; work with webhooks and basic auth.',
      'Project: Automate a recurring task end-to-end using a low-code tool + small script.',
      'Next: Learn versioning and monitoring for automations and how to scale flows.',
    ],
  },
  'AI & Workflow Integration': {
    title: 'AI & Workflow Integration — Starter Roadmap',
    steps: [
      'Concepts: Learn what AI/ML means practically — prompt engineering, embeddings, simple models.',
      'APIs: Explore LLM APIs (OpenAI/others) and how to call them from apps/flows.',
      'Data prep: Learn how to prepare and sanitize data for AI (clean text, embeddings basics).',
      'Integration: Build a small workflow that uses an LLM to automate a business task (summaries, triage).',
      'Ethics & Monitoring: Learn basics of AI safety, biases, and evaluation metrics.',
      'Next: Combine AI with automation platforms to create intelligent flows.',
    ],
  },
}

export default function StudentQuestionnaire() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [step, setStep] = useState<'career' | 'culture' | 'results'>('career')
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

  const [error, setError] = useState('')
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

    const c = localStorage.getItem(`questionnaire_career_${u.email}`)
    if (c) {
      const parsed = JSON.parse(c)
      if (parsed.answers) setCareerAnswers(parsed.answers)
      if (parsed.openAnswers) setCareerOpenAnswers(parsed.openAnswers)
      const savedCulture = localStorage.getItem(`questionnaire_culture_${u.email}`)
      if (savedCulture) setCultureAnswers(JSON.parse(savedCulture).answers || {})
      const { top, scores } = computePathwayFromAnswers(parsed.answers || careerAnswers)
      setComputedPathway(top)
      setPathwayScores(scores)
      setStep('results')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  function computePathwayFromAnswers(answersObj: CareerAnswers) {
    const scores: Record<PathwayKey, number> = {
      'Cloud & Infrastructure': 0,
      'Business Analysis & Delivery': 0,
      'Data & Analytics': 0,
      'Automation / Low-Code': 0,
      'AI & Workflow Integration': 0,
    }
    for (const q of Object.keys(answersObj)) {
      const val = Number(answersObj[q] ?? 0)
      const weights = careerQuestionWeights[q] || [0, 0, 0, 0, 0]
      pathwayKeys.forEach((pKey, idx) => {
        scores[pKey] += (weights[idx] || 0) * val
      })
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const top = sorted[0][0] as PathwayKey
    return { top, scores }
  }

  const onSelectCareerOption = (val: number) => {
    const id = careerQuestions[careerIndex].type === 'likert' ? careerQuestions[careerIndex].id : null
    if (!id) return
    setCareerAnswers(prev => ({ ...prev, [id]: val }))
  }

  const onChangeCareerOpen = (text: string) => {
    const id = careerQuestions[careerIndex].type === 'open' ? careerQuestions[careerIndex].id : null
    if (!id) return
    setCareerOpenAnswers(prev => ({ ...prev, [id]: text }))
  }

  const onSelectCultureOption = (val: number) => {
    const qId = cultureQuestions[cultureIndex].id
    setCultureAnswers(prev => ({ ...prev, [qId]: val }))
  }

  const goCareerNext = () => {
    if (careerIndex < careerQuestions.length - 1) {
      setCareerIndex(i => i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
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
    if (currentUser?.email) {
      localStorage.setItem(`questionnaire_culture_${currentUser.email}`, JSON.stringify({
        answers: cultureAnswers,
        submittedAt: new Date().toISOString(),
      }))
      localStorage.setItem(`questionnaire_${currentUser.email}`, JSON.stringify({ careerAt: new Date().toISOString() }))
    }
    setStep('results')
    setCultureIndex(0)
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

  const summaryCulture = useMemo(() => {
    const independence = Number(cultureAnswers['c1'] ?? 2)
    const pace = Number(cultureAnswers['c2'] ?? 2)
    const mentorship = Number(cultureAnswers['c3'] ?? 2)
    const stability = Number(cultureAnswers['c4'] ?? 2)
    const comms = Number(cultureAnswers['c5'] ?? 2)
    const experimentation = Number(cultureAnswers['c6'] ?? 2)
    return { independence, pace, mentorship, stability, comms, experimentation }
  }, [cultureAnswers])

  const likertLabels = [
    'Very inaccurate',
    'Moderately inaccurate',
    'Neither accurate nor inaccurate',
    'Moderately accurate',
    'Very accurate',
  ]

  const careerProgress = Math.round(((careerIndex + 1) / careerQuestions.length) * 100)
  const cultureProgress = Math.round(((cultureIndex + 1) / cultureQuestions.length) * 100)
  const progress = step === 'career' ? careerProgress : step === 'culture' ? cultureProgress : 100

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
          rows={5}
          className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-foreground"
        />
        <div className="text-sm text-foreground/60 mt-2 text-right">{val.length}/{maxLen}</div>
      </div>
    )
  }

  // NEW: robust dashboard navigation helper
  const navigateToDashboard = () => {
    // Prefer SPA navigation, but fallback to full reload to avoid unexpected dashboard-state behavior
    try {
      router.push('/student/dashboard')
      // Also force a full reload (useful if dashboard has client-side logic that opens the scorecard)
      // This ensures the dashboard loads fresh and avoids leftover UI state.
      // We use assign() so browser history behaves normally.
      window.location.assign('/student/dashboard')
    } catch (e) {
      // final fallback
      window.location.href = '/student/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-6 py-8">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="p-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">{
                step === 'career' ? 'Career Clarity' : step === 'culture' ? 'Culture fit' : 'Your Roadmap'
              }</CardTitle>
              <div className="text-sm text-foreground/60">Reference: <span className="font-mono text-xs">{CAREER_SCREENSHOT_REF}</span></div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button className="px-4 py-2 shadow-md bg-white border border-blue-200 text-blue-700">Learn more</Button>
              <div className="flex-1 px-6">
                <div className="w-full bg-slate-200 h-3 rounded-md overflow-hidden">
                  <div
                    className="h-3 rounded-md bg-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                    aria-hidden
                  />
                </div>
              </div>
              <div style={{ width: 120 }} />
            </div>

            {step === 'career' && (
              <>
                <div className="text-center mb-6">
                  <div className="text-sm text-foreground/60">Question {careerIndex + 1} of {careerQuestions.length}</div>
                  <div className="mt-3 text-lg font-semibold">{careerQuestions[careerIndex].text}</div>
                </div>

                <div className="flex flex-col items-center">
                  {careerQuestions[careerIndex].type === 'likert' ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {likertLabels.map((label, idx) => {
                        const id = careerQuestions[careerIndex].id
                        const selected = (careerAnswers[id] ?? 2) === idx
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => onSelectCareerOption(idx)}
                            className={`mx-auto px-6 py-3 rounded-full border 
                              ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300'}
                              shadow-sm transition`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    renderOpenQuestion(careerQuestions[careerIndex])
                  )}

                  <div className="w-full flex items-center justify-between mt-8">
                    <button
                      type="button"
                      onClick={goCareerPrev}
                      className="text-blue-700 font-medium"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="text-sm text-foreground/60">Progress: {progress}%</div>
                      <button
                        type="button"
                        onClick={goCareerNext}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium"
                      >
                        {careerIndex < careerQuestions.length - 1 ? 'Next' : 'Continue'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 'culture' && (
              <>
                <div className="text-center mb-6">
                  <div className="text-sm text-foreground/60">Culture question {cultureIndex + 1} of {cultureQuestions.length}</div>
                  <div className="mt-3 text-lg font-semibold">{cultureQuestions[cultureIndex].text}</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {likertLabels.map((label, idx) => {
                      const selected = cultureAnswers[cultureQuestions[cultureIndex].id] === idx
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => onSelectCultureOption(idx)}
                          className={`mx-auto px-5 py-3 rounded-full border 
                            ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300'}
                            shadow-sm transition`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="w-full flex items-center justify-between mt-8">
                    <button type="button" onClick={goCulturePrev} className="text-blue-700 font-medium">Previous</button>

                    <div className="flex items-center gap-3">
                      <div className="text-sm text-foreground/60">Progress: {progress}%</div>
                      <button type="button" onClick={goCultureNext} className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium">
                        {cultureIndex < cultureQuestions.length - 1 ? 'Next' : 'Finish'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 'results' && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-xl font-semibold">Your Suggested Pathway</div>
                  <div className="mt-3 text-lg text-blue-700 font-bold">{computedPathway}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded">
                    <div className="font-medium mb-2">Roadmap</div>
                    <ol className="list-decimal list-inside space-y-2">
                      {computedPathway && pathwayRoadmaps[computedPathway].steps.map((s, i) => (
                        <li key={i} className="text-sm">{s}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-4 border rounded">
                    <div className="font-medium mb-2">Culture fit summary</div>
                    <div className="text-sm space-y-1">
                      <div>Independent work: {summaryCulture.independence}/4</div>
                      <div>Prefers fast pace: {summaryCulture.pace}/4</div>
                      <div>Mentorship need: {summaryCulture.mentorship}/4</div>
                      <div>Stability preference: {summaryCulture.stability}/4</div>
                      <div>Communication comfort: {summaryCulture.comms}/4</div>
                      <div>Experimentation: {summaryCulture.experimentation}/4</div>
                    </div>

                    <div className="mt-4">
                      <div className="font-medium mb-2">Your open responses (summary)</div>
                      <div className="text-sm space-y-2">
                        {Object.entries(careerOpenAnswers).length === 0 ? (
                          <div className="text-foreground/70">No open answers provided.</div>
                        ) : (
                          Object.entries(careerOpenAnswers).map(([k, v]) => (
                            <div key={k}>
                              <div className="text-xs text-foreground/60 font-medium">{k}</div>
                              <div className="text-sm">{v || <span className="text-foreground/60">—</span>}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  {/* use navigateToDashboard helper to force a full navigation */}
                  <Button type="button" onClick={navigateToDashboard} className="bg-blue-600 text-white">Go to Dashboard</Button>
                  <Button type="button" onClick={retakeAll} className="bg-white border border-blue-300 text-blue-700">Retake Assessments</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
