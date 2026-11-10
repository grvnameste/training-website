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
    <div className="min-h-screen px-6 py-10 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Preparation
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Practice interview questions, record answers, and get AI-powered
            feedback to improve clarity and confidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1.5fr_1.15fr]">
          {/* LEFT */}
          <Card className="rounded-xl border bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  placeholder="Search questions…"
                  className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="rounded-lg bg-slate-50 p-3">
                  <button
                    className="mb-2 w-full text-left text-sm font-semibold text-blue-700"
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
                          className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                            isActive
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="line-clamp-2 font-medium">
                            {q.text}
                          </div>
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

          {/* MIDDLE */}
          <div className="space-y-4">
            <Card className="rounded-xl border bg-white shadow-sm">
              <CardHeader>
                <p className="text-xs uppercase tracking-wide text-blue-600">
                  {activeQuestion.type}
                </p>
                <CardTitle className="text-lg">
                  {activeQuestion.text}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-sm text-slate-600 text-center max-w-sm">
                  Enable your camera and microphone to start recording your
                  answer.
                </p>

                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Video className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500" />
                Start Recording
              </Button>

              <Button
                variant="outline"
                className="rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Example
              </Button>
            </div>
          </div>

          {/* RIGHT */}
          <Card className="rounded-xl border bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex border-b text-sm">
                {['example', 'feedback'].map(tab => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(tab as 'example' | 'feedback')
                    }
                    className={`px-4 py-2 transition ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-700 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {tab === 'example'
                      ? 'Example Answer'
                      : 'AI Feedback'}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="max-h-[460px] overflow-y-auto text-sm text-slate-700 space-y-3">
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
