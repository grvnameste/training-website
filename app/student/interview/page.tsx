'use client'

import { useState } from 'react'
import { Search, Video, Mic, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
        tags: 'Behavioral · Communication',
      },
      {
        id: 'q2',
        text: 'How do you prioritize requirements?',
        type: 'Interview Question',
        tags: 'Technical · Prioritization',
      },
      {
        id: 'q3',
        text: 'What is the difference between Agile and Scrum?',
        type: 'Interview Question',
        tags: 'Technical · Methodology',
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
        tags: 'Cloud · Fundamentals',
      },
      {
        id: 'q5',
        text: 'How would you design a scalable web application?',
        type: 'System Design Question',
        tags: 'Architecture · Scalability',
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
        tags: 'Testing · Concepts',
      },
    ],
  },
]

export default function InterviewPage() {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id)
  const [activeQuestionId, setActiveQuestionId] = useState(
    categories[0].questions[0].id
  )
  const [activeTab, setActiveTab] =
    useState<'example' | 'feedback'>('example')

  const activeCategory =
    categories.find(c => c.id === activeCategoryId) ?? categories[0]

  const activeQuestion =
    activeCategory.questions.find(q => q.id === activeQuestionId) ??
    activeCategory.questions[0]

  return (
    <div className="relative min-h-screen px-6 py-10 text-white">
      {/* GRID BG */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOWS */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Preparation
          </h1>
          <p className="mt-1 text-sm text-white/70 max-w-2xl">
            Practice interview questions, record answers, and get AI-powered feedback to improve clarity and confidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1.5fr_1.15fr]">
          {/* LEFT */}
          <Card className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <input
                  placeholder="Search questions…"
                  className="w-full rounded-xl bg-black/40 border border-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="rounded-2xl bg-black/30 p-3">
                  <button
                    className="mb-2 w-full text-left text-sm font-semibold text-teal-300"
                    onClick={() => {
                      setActiveCategoryId(category.id)
                      setActiveQuestionId(category.questions[0]?.id ?? '')
                    }}
                  >
                    {category.title}
                  </button>

                  <div className="space-y-2">
                    {category.questions.map(q => {
                      const isActive = q.id === activeQuestionId
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setActiveCategoryId(category.id)
                            setActiveQuestionId(q.id)
                          }}
                          className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition
                            ${
                              isActive
                                ? 'bg-teal-400/20 border-teal-400 text-teal-200'
                                : 'bg-black/40 border-white/10 text-white/70 hover:bg-black/60'
                            }`}
                        >
                          <div className="line-clamp-2 font-medium text-white">
                            {q.text}
                          </div>
                          <div className="mt-1 text-[11px] text-white/50">
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

          {/* MIDDLE */}
          <div className="space-y-4">
            <Card className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl">
              <CardHeader>
                <p className="text-xs uppercase tracking-wide text-teal-300">
                  {activeQuestion.type}
                </p>
                <CardTitle className="text-lg text-white">
                  {activeQuestion.text}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur shadow-xl">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-sm text-white/70 text-center max-w-sm">
                  Enable your camera and microphone to start recording your answer.
                </p>

                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full bg-teal-400 text-black hover:bg-teal-300">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500" />
                Start Recording
              </Button>

              <Button
                variant="outline"
                className="rounded-full border-white/20 bg-black/40 text-white hover:bg-black/60"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Example
              </Button>
            </div>
          </div>

          {/* RIGHT */}
          <Card className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex border-b border-white/10 text-sm">
                {['example', 'feedback'].map(tab => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(tab as 'example' | 'feedback')
                    }
                    className={`px-4 py-2 transition ${
                      activeTab === tab
                        ? 'border-b-2 border-teal-400 text-teal-300 font-semibold'
                        : 'text-white/50'
                    }`}
                  >
                    {tab === 'example'
                      ? 'Example Answer'
                      : 'AI Feedback'}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="max-h-[460px] overflow-y-auto text-sm text-white/80 space-y-3">
              {activeTab === 'example' ? (
                <p>
                  Use the <b>STAR</b> method: Situation, Task, Action, Result.
                </p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Good structure and clarity</li>
                  <li>Try to add metrics or outcomes</li>
                  <li>Keep the answer concise</li>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
