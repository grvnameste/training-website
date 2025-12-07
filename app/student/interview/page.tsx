// app/student/interview/page.tsx
'use client'

import { useState } from 'react'
import { Search, Video, Mic, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Question = {
  id: string
  text: string
  type: string
  tags: string
}

type Category = {
  id: string
  title: string
  questions: Question[]
}

const categories: Category[] = [
  {
    id: 'business-analyst',
    title: 'Business Analyst',
    questions: [
      {
        id: 'q1',
        text: 'Tell me about a time you handled a difficult stakeholder.',
        type: 'Behavioral Question',
        tags: 'Behavioral | Communication',
      },
      {
        id: 'q2',
        text: 'How do you prioritize requirements?',
        type: 'Interview Question',
        tags: 'Technical | Prioritization',
      },
      {
        id: 'q3',
        text: 'What is the difference between Agile and Scrum?',
        type: 'Interview Question',
        tags: 'Technical | Methodology',
      },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud Engineering',
    questions: [
      {
        id: 'q4',
        text: 'Explain the difference between IaaS, PaaS, and SaaS.',
        type: 'Interview Question',
        tags: 'Cloud | Fundamentals',
      },
      {
        id: 'q5',
        text: 'How would you design a scalable web application?',
        type: 'System Design Question',
        tags: 'Architecture | Scalability',
      },
    ],
  },
  {
    id: 'testing',
    title: 'Automation Testing',
    questions: [
      {
        id: 'q6',
        text: 'What is the difference between regression and re-testing?',
        type: 'Interview Question',
        tags: 'Testing | Concepts',
      },
    ],
  },
]

export default function InterviewPage() {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id)
  const [activeQuestionId, setActiveQuestionId] = useState(
    categories[0].questions[0].id
  )
  const [activeTab, setActiveTab] = useState<'example' | 'feedback'>('example')

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0]
  const activeQuestion =
    activeCategory.questions.find((q) => q.id === activeQuestionId) ??
    activeCategory.questions[0]

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Interview Preparation
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Record your answers, get instant AI feedback, and practice with expert
            examples.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1.1fr)]">
        {/* LEFT: categories + questions */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-2xl bg-slate-50 p-3">
                <button
                  type="button"
                  className="mb-2 flex w-full items-center justify-between text-left"
                  onClick={() => {
                    setActiveCategoryId(category.id)
                    setActiveQuestionId(category.questions[0]?.id ?? '')
                  }}
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {category.title}
                  </span>
                </button>
                <div className="space-y-1.5">
                  {category.questions.map((q) => {
                    const isActive = q.id === activeQuestionId
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setActiveCategoryId(category.id)
                          setActiveQuestionId(q.id)
                        }}
                        className={[
                          'w-full rounded-xl border px-3 py-2 text-left text-xs transition-colors',
                          isActive
                            ? 'border-teal-600 bg-teal-50 text-teal-900'
                            : 'border-transparent bg-white text-slate-700 hover:bg-slate-100',
                        ].join(' ')}
                      >
                        <div className="line-clamp-2 font-medium">{q.text}</div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {q.tags}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* MIDDLE: question + video area */}
        <div className="space-y-4">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                {activeQuestion.type}
              </p>
              <CardTitle className="text-base md:text-lg">
                {activeQuestion.text}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-slate-900 text-white shadow-lg">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10">
              <div className="rounded-2xl bg-black/40 px-4 py-3 text-center text-xs text-slate-100">
                <p className="mb-1 font-medium">Ready to Record?</p>
                <p className="text-[11px] text-slate-200/80">
                  Enable your camera and microphone to start practicing. Your
                  recording will begin after a short countdown.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40">
                  <Video className="h-4 w-4" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40">
                  <Mic className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold hover:bg-teal-700">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Start Recording
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <Sparkles className="h-4 w-4" />
              View Example Answer
            </Button>
          </div>
        </div>

        {/* RIGHT: Example Answer / AI Feedback */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex border-b border-slate-200 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab('example')}
                className={[
                  'px-4 py-2',
                  activeTab === 'example'
                    ? 'border-b-2 border-teal-600 font-semibold text-teal-700'
                    : 'text-slate-500',
                ].join(' ')}
              >
                Example Answer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('feedback')}
                className={[
                  'px-4 py-2',
                  activeTab === 'feedback'
                    ? 'border-b-2 border-teal-600 font-semibold text-teal-700'
                    : 'text-slate-500',
                ].join(' ')}
              >
                AI Feedback
              </button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[460px] space-y-3 overflow-y-auto text-sm text-slate-700">
            {activeTab === 'example' ? (
              <>
                <p className="font-semibold">
                  Structure your answer using the STAR method:
                </p>
                <p className="mt-2 font-semibold">Situation</p>
                <p>
                  &quot;In my previous role as a Business Analyst, we were launching a
                  new CRM system. One of the key stakeholders was very resistant to the
                  change and worried it would slow down his team.&quot;
                </p>

                <p className="mt-2 font-semibold">Task</p>
                <p>
                  &quot;My task was to ensure the project moved forward smoothly and to
                  get his buy-in without delaying the launch.&quot;
                </p>

                <p className="mt-2 font-semibold">Action</p>
                <p>
                  &quot;I set up a one-on-one meeting, listened to his concerns,
                  prepared a tailored demo, and involved him in refining the final
                  workflow.&quot;
                </p>

                <p className="mt-2 font-semibold">Result</p>
                <p>
                  &quot;He became a strong supporter of the new system, and the rollout
                  completed on time with minimal disruption.&quot;
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">AI Feedback (sample)</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Good use of the STAR framework.</li>
                  <li>Try to quantify your impact with numbers where possible.</li>
                  <li>Mention specific tools or techniques you used.</li>
                  <li>
                    Keep your answer concise (around 1.5–2 minutes) for real interviews.
                  </li>
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
