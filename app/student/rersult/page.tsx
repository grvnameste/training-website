'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, Share2 } from 'lucide-react'

type CareerAnswers = Record<string, number>
type CareerOpenAnswers = Record<string, string>
type CultureAnswers = Record<string, number>

type PathwayKey =
  | 'Cloud & Infrastructure'
  | 'Business Analysis & Delivery'
  | 'Data & Analytics'
  | 'Automation / Low-Code'
  | 'AI & Workflow Integration'

const pathwayRoadmaps: Record<PathwayKey, { title: string; steps: string[] }> = {
  'Cloud & Infrastructure': {
    title: 'Cloud Engineering — Starter Roadmap',
    steps: [
      'Week 1–2: Linux, Networking basics, CLI',
      'Week 3–4: Cloud fundamentals (VMs, Storage, IAM)',
      'Week 5–8: Deploy sample apps and learn IaC (Terraform)',
      'Week 9–12: Containers + Kubernetes basics',
      'Week 13–16: Build a small infra project & prep for cert',
    ],
  },
  'Business Analysis & Delivery': {
    title: 'Business Analysis & Delivery — Starter Roadmap',
    steps: [
      'Week 1–2: Requirements & stakeholder interviewing',
      'Week 3–4: Documentation, user stories, acceptance criteria',
      'Week 5–8: Basic SQL and analytics for BA',
      'Week 9–12: Agile delivery + Jira/Confluence practice',
      'Week 13–16: Build 2 case studies and portfolio notes',
    ],
  },
  'Data & Analytics': {
    title: 'Data & Analytics — Starter Roadmap',
    steps: [
      'Week 1–2: Statistics basics & Excel',
      'Week 3–6: SQL + Python (pandas) for cleaning',
      'Week 7–10: Visualization & BI tool (PowerBI/Tableau)',
      'Week 11–13: Small end-to-end analysis project',
      'Week 14–16: Intro ML concepts and portfolio polish',
    ],
  },
  'Automation / Low-Code': {
    title: 'Automation / Low-Code — Starter Roadmap',
    steps: [
      'Week 1–2: Document processes and basic scripting',
      'Week 3–6: Explore Zapier / Make / Power Automate',
      'Week 7–10: Integrations and webhooks',
      'Week 11–13: Build an end-to-end automation (monitoring)',
      'Week 14–16: Versioning, scale patterns and portfolio',
    ],
  },
  'AI & Workflow Integration': {
    title: 'AI & Workflow Integration — Starter Roadmap',
    steps: [
      'Week 1–2: Practical concepts — prompts, embeddings',
      'Week 3–6: Calling LLM APIs from apps',
      'Week 7–10: Data prep and evaluation',
      'Week 11–13: Build an LLM workflow (summaries/triage)',
      'Week 14–16: Deploy and monitor the intelligent flow',
    ],
  },
}

function computePathwayFromAnswers(answersObj: CareerAnswers | null) {
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

function sampleTargetJobsFor(pathway: PathwayKey | null) {
  switch (pathway) {
    case 'Cloud & Infrastructure': return ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect', 'Cloud Support Associate']
    case 'Business Analysis & Delivery': return ['Business Analyst', 'Product Analyst', 'Delivery Lead', 'Project Coordinator']
    case 'Data & Analytics': return ['Data Analyst', 'Business Intelligence Engineer', 'Analytics Engineer', 'Data Engineer (junior)']
    case 'Automation / Low-Code': return ['Automation Engineer', 'RPA Developer', 'Integration Specialist', 'Low-Code Developer']
    case 'AI & Workflow Integration': return ['AI Integrations Engineer', 'Prompt Engineer', 'AI Product Associate', 'ML Ops (junior)']
    default: return ['Generalist — multiple tracks']
  }
}

export default function QuestionnaireResult() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [careerAnswers, setCareerAnswers] = useState<CareerAnswers | null>(null)
  const [careerOpenAnswers, setCareerOpenAnswers] = useState<CareerOpenAnswers | null>(null)
  const [cultureAnswers, setCultureAnswers] = useState<CultureAnswers | null>(null)
  const [computedTop, setComputedTop] = useState<PathwayKey | null>(null)
  const [scores, setScores] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    const u = (() => {
      try { return JSON.parse(localStorage.getItem('lms_current_user') || 'null') } catch { return null }
    })()
    if (!u?.email) {
      router.push('/student/questionnaire')
      return
    }
    setUser(u)

    const careerRaw = localStorage.getItem(`questionnaire_career_${u.email}`)
    const cultureRaw = localStorage.getItem(`questionnaire_culture_${u.email}`)

    let parsedCareer: any = null
    if (careerRaw) {
      try { parsedCareer = JSON.parse(careerRaw) } catch { parsedCareer = null }
    }

    if (parsedCareer?.answers) {
      setCareerAnswers(parsedCareer.answers)
      setCareerOpenAnswers(parsedCareer.openAnswers || {})
      const { top, scores } = computePathwayFromAnswers(parsedCareer.answers)
      setComputedTop(top)
      setScores(scores)
    } else {
      router.push('/student/questionnaire')
    }

    if (cultureRaw) {
      try { setCultureAnswers(JSON.parse(cultureRaw).answers || {}) } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const coreStrengths = useMemo(() => {
    if (!computedTop) return ['Analytical Thinking', 'Problem Solving', 'Adaptability']
    switch (computedTop) {
      case 'Cloud & Infrastructure': return ['Analytical Thinking', 'Problem Solving', 'Systems Thinking']
      case 'Business Analysis & Delivery': return ['Stakeholder Communication', 'Documentation', 'Process Thinking']
      case 'Data & Analytics': return ['Data Literacy', 'Analytical Thinking', 'Visualization']
      case 'Automation / Low-Code': return ['Process Mapping', 'Scripting Basics', 'Integration Skills']
      case 'AI & Workflow Integration': return ['Prompt & API Integration', 'Data Prep', 'Experimentation']
      default: return ['Analytical Thinking', 'Problem Solving', 'Systems Thinking']
    }
  }, [computedTop])

  const estimatedSalary = useMemo(() => {
    switch (computedTop) {
      case 'Cloud & Infrastructure': return '$85k - $120k'
      case 'Business Analysis & Delivery': return '$60k - $90k'
      case 'Data & Analytics': return '$70k - $110k'
      case 'Automation / Low-Code': return '$55k - $85k'
      case 'AI & Workflow Integration': return '$80k - $120k'
      default: return '—'
    }
  }, [computedTop])

  const recommendedCert = useMemo(() => {
    switch (computedTop) {
      case 'Cloud & Infrastructure': return { title: 'AWS Certified Solutions Architect – Associate', note: 'Validate cloud fundamentals and architecture' }
      case 'Data & Analytics': return { title: 'Google Data Analytics / SQL course', note: 'Basic data skills & SQL' }
      case 'Business Analysis & Delivery': return { title: 'CBAP / Business Analysis course', note: 'Requirements & stakeholder skills' }
      case 'Automation / Low-Code': return { title: 'Power Platform / Automation course', note: 'Low-code automation foundations' }
      case 'AI & Workflow Integration': return { title: 'Intro to LLM APIs & Prompting', note: 'Practical LLM integration' }
      default: return { title: 'Foundational Certificate', note: 'Start with basics relevant to the path' }
    }
  }, [computedTop])

  const roadmap = computedTop ? pathwayRoadmaps[computedTop] : null

  const collapseStateInitial = useMemo(() => new Array(4).fill(false), [])
  const [collapsed, setCollapsed] = useState<boolean[]>(collapseStateInitial)

  useEffect(() => {
    if (user && !computedTop) {
      router.push('/student/questionnaire')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, computedTop])

  if (!user || !computedTop) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground/900">Your Career Compass Results</h1>
            <p className="text-sm text-foreground/60 mt-2">Based on your assessment, we’ve identified a pathway that aligns with your strengths and interests.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Prominent Share button styled as an outlined primary action */}
            <Button className="flex items-center gap-2 border bg-white text-indigo-700 hover:bg-indigo-50" onClick={() => { /* share handler */ }}>
              <Share2 className="w-4 h-4" /> Share My Results
            </Button>

            {/* Clear primary Go to Dashboard button in header */}
            <Button
              onClick={() => router.push('/student/dashboard')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300"
            >
              Go to Dashboard
            </Button>

            <div className="w-10 h-10 rounded-full bg-amber-100" />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold">★</div>
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-medium">Your Recommended Pathway</div>
                  <div className="text-2xl font-bold mt-1">{computedTop}</div>
                  <p className="text-sm text-foreground/70 mt-2">
                    This path is an excellent fit for your strengths. It offers hands-on learning and clear progression — use the roadmap below to plan your next 16 weeks.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Core Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {coreStrengths.map((s) => (
                      <div key={s} className="p-3 bg-slate-50 rounded-md text-sm">{s}<div className="text-xs text-foreground/60 mt-1">Short note about {s.toLowerCase()}.</div></div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Certification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">Logo</div>
                    <div>
                      <div className="font-medium">{recommendedCert.title}</div>
                      <div className="text-sm text-foreground/60 mt-1">{recommendedCert.note}</div>
                      <div className="mt-3"><a className="text-indigo-600 text-sm">Learn More →</a></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Portfolio Project Idea</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">Build a small project to showcase skills relevant to {computedTop}. For example:</div>
                  <div className="mt-3 text-sm bg-slate-50 p-3 rounded">Deploy a scalable web app using cloud services (serverless functions, storage, basic CI).</div>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4">
              <h2 className="text-xl font-semibold text-center mb-6">Your Personalized 16-Week Roadmap</h2>

              <div className="space-y-3">
                {(roadmap?.steps || []).map((s, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-medium">W{i+1}</div>
                        <div>
                          <div className="font-medium">{roadmap?.title?.split('—')[0] ?? `Week ${i+1}`}: {s.split(':')[0]}</div>
                          <div className="text-sm text-foreground/60">{s}</div>
                        </div>
                      </div>
                      <button
                        className="p-2 rounded-md hover:bg-slate-100"
                        onClick={() => {
                          setCollapsed(prev => {
                            const copy = prev.slice()
                            copy[i] = !copy[i]
                            return copy
                          })
                        }}
                        aria-expanded={!collapsed[i]}
                      >
                        <ChevronDown className={`transition-transform ${collapsed[i] ? 'rotate-180' : 'rotate-0'}`} />
                      </button>
                    </div>
                    {!collapsed[i] && (
                      <div className="mt-3 text-sm text-foreground/700">
                        <ul className="list-disc ml-5">
                          <li>Goals: Understand the core concept and hands-on tasks.</li>
                          <li>Time: ~ 6-10 hours per week depending on depth.</li>
                          <li>Deliverable: small project or exercise for portfolio.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                <div className="text-center mt-6">
                  {/* Primary "View Full 16-Week Roadmap" CTA */}
                  <Button
                    onClick={() => { /* navigate to full roadmap if exists */ }}
                    className="bg-indigo-600 text-white px-5 py-3 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300"
                  >
                    View Full 16-Week Roadmap
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                {/* Primary "Start Your 16-Week Journey" CTA in the sidebar uses same visual style; keep secondary here */}
                <Button
                  onClick={() => { /* start journey handler */ }}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300"
                >
                  Start Your 16-Week Journey
                </Button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-foreground/60">Target Job Titles</div>
              <div className="font-medium mt-2">
                {sampleTargetJobsFor(computedTop).map((j) => (
                  <div key={j} className="text-sm text-foreground/800">{j}</div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-foreground/60">Estimated Salary</div>
              <div className="text-2xl font-bold text-green-700 mt-2">{estimatedSalary}</div>
              <div className="text-xs text-foreground/60 mt-1">Entry-level, regional averages</div>
            </div>

            <div className="p-4 rounded-lg" style={{ background: '#07203f', color: 'white' }}>
              <div className="text-lg font-bold">Ready to Start?</div>
              <div className="text-sm mt-2">Your journey to becoming a {computedTop?.split(' ')[0]} begins now.</div>
              <div className="mt-4">
                <Button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300">
                  Start Your 16-Week Journey
                </Button>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg shadow-sm flex flex-col gap-2">
              {/* Sidebar Go to Dashboard made a visible primary-outline */}
              <Button className="bg-white border text-indigo-700 hover:bg-indigo-50" onClick={() => router.push('/student/dashboard')}>Go to Dashboard</Button>
              <Button
                variant="ghost"
                className="border rounded"
                onClick={() => {
                  if (!user?.email) return
                  localStorage.removeItem(`questionnaire_career_${user.email}`)
                  localStorage.removeItem(`questionnaire_culture_${user.email}`)
                  localStorage.removeItem(`questionnaire_${user.email}`)
                  router.push('/student/questionnaire')
                }}
              >
                Retake Assessment
              </Button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
