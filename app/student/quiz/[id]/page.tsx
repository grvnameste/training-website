'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Check,
  Send,
  Eye,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  getQuizMeta,
  getQuizQuestions,
  generateQuizFeedback,
  QuizMeta,
  Question,
  QuizFeedback
} from '@/lib/quiz/quizData'

const STORAGE_HISTORY_KEY = 'student:quiz_history'
const STORAGE_BANK_KEY = 'student:quizBank_v2'

export default function StudentQuizPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const quizId = (params?.id as string) || 'q1'
  const isInitialPreview = searchParams.get('preview') === 'true'

  // Quiz definitions & metadata
  const [meta, setMeta] = useState<QuizMeta>(() => getQuizMeta(quizId))
  const [questions, setQuestions] = useState<Question[]>(() => getQuizQuestions(quizId))

  // App States: 'preview' | 'taking' | 'submitted'
  const [quizState, setQuizState] = useState<'preview' | 'taking' | 'submitted'>(
    isInitialPreview ? 'preview' : 'preview'
  )

  // In-quiz state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [flagged, setFlagged] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState<number>(() => meta.durationMinutes * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0)

  // Results & Feedback
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct' | 'flagged'>('all')
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([])

  // Sync quiz metadata & questions when quizId route param changes, and load history from server + localStorage
  useEffect(() => {
    let active = true
    const defaultMeta = getQuizMeta(quizId)
    setMeta(defaultMeta)
    setQuestions(getQuizQuestions(quizId))
    setTimeLeft(defaultMeta.durationMinutes * 60)

    let localMatching: any[] = []
    try {
      const storedBank = localStorage.getItem(STORAGE_BANK_KEY)
      if (storedBank) {
        const parsed = JSON.parse(storedBank)
        const found = parsed.find((q: any) => q.id === quizId)
        if (found) {
          setMeta((prev) => ({
            ...prev,
            title: found.title || prev.title,
            skills: found.skills || prev.skills,
            durationMinutes: found.durationMinutes || prev.durationMinutes,
            difficulty: found.difficulty || prev.difficulty,
          }))
          setTimeLeft((found.durationMinutes || defaultMeta.durationMinutes) * 60)
        }
      }

      const storedHistory = localStorage.getItem(STORAGE_HISTORY_KEY)
      if (storedHistory) {
        const historyList = JSON.parse(storedHistory)
        localMatching = historyList.filter((item: any) => item.quizId === quizId)
        setPreviousAttempts(localMatching)
      }
    } catch (e) {
      console.warn('Error reading quiz storage:', e)
    }

    fetch(`/api/student/quiz/submit?quizId=${encodeURIComponent(quizId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !Array.isArray(data?.attempts) || data.attempts.length === 0) return
        setPreviousAttempts((prev) => {
          const seen = new Set(data.attempts.map((a: any) => a.completedAt))
          const merged = [
            ...data.attempts,
            ...prev.filter((p) => !seen.has(p.completedAt)),
          ]
          return merged.slice(0, 10)
        })
      })
      .catch(() => null)

    return () => {
      active = false
    }
  }, [quizId])

  const submitQuizRef = useRef<(auto?: boolean) => void>(() => {})

  // Timer countdown
  useEffect(() => {
    if (quizState !== 'taking') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          submitQuizRef.current(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState])

  // Start Quiz Handler
  const startQuiz = () => {
    setTimeLeft(meta.durationMinutes * 60)
    setAnswers({})
    setFlagged({})
    setCurrentIndex(0)
    setStartTime(Date.now())
    setQuizState('taking')
  }

  // Answer selection
  const handleSelectOption = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }))
  }

  // Toggle flag
  const toggleFlag = (index: number) => {
    setFlagged(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Final submission & score calculation
  const submitQuiz = async (auto = false) => {
    setIsSubmitting(true)
    const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : (meta.durationMinutes * 60 - timeLeft)
    setTimeSpentSeconds(elapsed)

    // Compute automated feedback
    const generatedFeedback = generateQuizFeedback(questions, answers)
    setFeedback(generatedFeedback)

    const submissionRecord = {
      id: `sub_${Date.now()}`,
      quizId,
      quizTitle: meta.title,
      score: generatedFeedback.overallScore,
      totalQuestions: questions.length,
      percentage: generatedFeedback.percentage,
      passed: generatedFeedback.passed,
      grade: generatedFeedback.grade,
      timeSpentSeconds: elapsed,
      completedAt: new Date().toISOString(),
      answers,
    }

    // Persist locally for instant offline cache and history
    try {
      const existing = localStorage.getItem(STORAGE_HISTORY_KEY)
      const list = existing ? JSON.parse(existing) : []
      list.unshift(submissionRecord)
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(list))
      setPreviousAttempts(prev => [submissionRecord, ...prev])
    } catch (err) {
      console.warn('Failed to persist locally:', err)
    }

    // Persist via server-authoritative API
    try {
      const res = await fetch('/api/student/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          quizTitle: meta.title,
          answers,
          timeSpentSeconds: elapsed,
        }),
      })
      if (res.ok) {
        toast.success(
          auto
            ? `Time expired — assessment auto-submitted (${generatedFeedback.percentage}%)`
            : `Assessment submitted! Score: ${generatedFeedback.percentage}%`
        )
      }
    } catch (apiErr) {
      console.warn('Server persist error:', apiErr)
    }

    setIsSubmitting(false)
    setConfirmSubmitOpen(false)
    setQuizState('submitted')
  }

  submitQuizRef.current = submitQuiz

  // Current question data
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progressPct = Math.round((answeredCount / questions.length) * 100)

  // Timer format (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isTimeCritical = timeLeft < 120 && quizState === 'taking'

  // Filtered review questions
  const filteredReviewQuestions = useMemo(() => {
    if (quizState !== 'submitted') return []
    return questions
      .map((q, idx) => ({ ...q, originalIndex: idx }))
      .filter(q => {
        const studentAns = answers[q.originalIndex]
        const isCorrect = studentAns === q.correctIndex
        if (reviewFilter === 'correct') return isCorrect
        if (reviewFilter === 'incorrect') return !isCorrect
        if (reviewFilter === 'flagged') return !!flagged[q.originalIndex]
        return true
      })
  }, [questions, answers, flagged, reviewFilter, quizState])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ============================================================== */}
      {/* 1. PREVIEW / INTRO MODE */}
      {/* ============================================================== */}
      {quizState === 'preview' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/student/skills')}
              className="group flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Skills & Quizzes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[2rem] border-slate-200/80 shadow-xl overflow-hidden bg-white">
                <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                <CardHeader className="p-8 md:p-10 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                      Assessment
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      Difficulty: {meta.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Pass Threshold: 70%
                    </span>
                  </div>

                  <CardTitle className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {meta.title}
                  </CardTitle>

                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    {meta.description}
                  </CardDescription>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {meta.skills.map(sk => (
                      <span key={sk} className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
                        #{sk}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="p-8 md:p-10 pt-0 space-y-6">
                  {/* Topics Covered */}
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Topics & Competencies Evaluated
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {meta.topicsCovered.map((topic, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700">
                          <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rules of Engagement */}
                  <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                    <h5 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-blue-600" /> Assessment Rules
                    </h5>
                    <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                      <li>Total questions: <strong>{questions.length} multiple-choice questions</strong>.</li>
                      <li>Strict timer: <strong>{meta.durationMinutes} minutes</strong> from start.</li>
                      <li>You can flag questions and navigate back and forth freely before submission.</li>
                      <li>Automated personalized feedback and score report will be generated upon completion.</li>
                    </ul>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      onClick={startQuiz}
                      className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Zap size={18} /> Start Assessment Now
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/student/skills')}
                      className="h-14 px-6 rounded-2xl border-slate-200 font-semibold"
                    >
                      Back to Skills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Col: Quick Stats & Past Attempts */}
            <div className="space-y-6">
              <Card className="rounded-[2rem] border-slate-200/80 shadow-md bg-white p-6 space-y-5">
                <h3 className="font-bold text-lg text-slate-800">Assessment Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                      <Clock size={16} className="text-slate-400" />
                      <span>Duration</span>
                    </div>
                    <span className="font-bold text-slate-900">{meta.durationMinutes} Mins</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                      <FileText size={16} className="text-slate-400" />
                      <span>Questions</span>
                    </div>
                    <span className="font-bold text-slate-900">{questions.length} Items</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                      <Award size={16} className="text-slate-400" />
                      <span>Benchmark Pass</span>
                    </div>
                    <span className="font-bold text-emerald-600">{meta.estimatedPassPct}% avg pass</span>
                  </div>
                </div>
              </Card>

              {/* Previous Attempts History */}
              {previousAttempts.length > 0 && (
                <Card className="rounded-[2rem] border-slate-200/80 shadow-md bg-white p-6 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Past Attempts</h3>
                  <div className="space-y-3">
                    {previousAttempts.slice(0, 3).map((attempt, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${attempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {attempt.passed ? 'Passed' : 'Needs Work'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* 2. ACTIVE QUIZ TAKING INTERFACE */}
      {/* ============================================================== */}
      {quizState === 'taking' && currentQuestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Top Sticky Bar: Timer, Progress & Quick Nav */}
          <div className="sticky top-[75px] z-30 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="w-48 md:w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600">{answeredCount}/{questions.length} answered</span>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border transition-all ${
                  isTimeCritical
                    ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Clock size={16} />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmSubmitOpen(true)}
                className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-bold"
              >
                <Send size={14} className="mr-1.5" /> Submit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left 3 Cols: Question Card */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="rounded-[2rem] border-slate-200/80 shadow-lg bg-white overflow-hidden p-6 md:p-8 space-y-6">
                {/* Question Header & Flag Toggle */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    Topic: {currentQuestion.topic}
                  </span>

                  <button
                    onClick={() => toggleFlag(currentIndex)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      flagged[currentIndex]
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Flag size={14} className={flagged[currentIndex] ? 'fill-amber-500 text-amber-500' : ''} />
                    {flagged[currentIndex] ? 'Flagged for Review' : 'Mark for Review'}
                  </button>
                </div>

                {/* Prompt */}
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                    {currentQuestion.question}
                  </h3>

                  {/* Code Snippet if present */}
                  {currentQuestion.codeSnippet && (
                    <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-sm overflow-x-auto shadow-inner border border-slate-800">
                      <pre><code>{currentQuestion.codeSnippet}</code></pre>
                    </div>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = answers[currentIndex] === optIdx
                    const letter = String.fromCharCode(65 + optIdx)

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {letter}
                        </div>
                        <span className="text-sm md:text-base font-medium pt-0.5 leading-relaxed">
                          {option}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(i => i - 1)}
                    className="rounded-xl px-5"
                  >
                    <ChevronLeft size={16} className="mr-1" /> Previous
                  </Button>

                  {currentIndex < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentIndex(i => i + 1)}
                      className="rounded-xl px-6 bg-slate-900 hover:bg-blue-600 text-white font-bold"
                    >
                      Next <ChevronRight size={16} className="ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setConfirmSubmitOpen(true)}
                      className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-200"
                    >
                      Finish & Submit <Send size={16} className="ml-1.5" />
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Right 1 Col: Question Grid Palette */}
            <div className="space-y-4">
              <Card className="rounded-[2rem] border-slate-200/80 shadow-md bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800">Question Palette</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {questions.length} Items
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, i) => {
                    const isCurrent = i === currentIndex
                    const isAnswered = answers[i] !== undefined
                    const isFlag = !!flagged[i]

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-9 rounded-xl font-mono text-xs font-bold transition-all relative ${
                          isCurrent
                            ? 'ring-2 ring-blue-600 ring-offset-2'
                            : ''
                        } ${
                          isAnswered
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {i + 1}
                        {isFlag && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-md" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-md" />
                    <span>Unanswered ({questions.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span>Flagged for review ({Object.values(flagged).filter(Boolean).length})</span>
                  </div>
                </div>

                <Button
                  onClick={() => setConfirmSubmitOpen(true)}
                  className="w-full mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Submit Assessment
                </Button>
              </Card>
            </div>
          </div>

          {/* Confirm Submit Modal */}
          {confirmSubmitOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <AlertCircle size={24} />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Ready to Submit?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    You have answered <span className="font-bold text-slate-800">{answeredCount} of {questions.length}</span> questions.
                    {questions.length - answeredCount > 0 && (
                      <span className="block text-amber-600 font-semibold mt-1">
                        ⚠️ You have {questions.length - answeredCount} unanswered questions!
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmSubmitOpen(false)}
                    className="flex-1 rounded-xl"
                  >
                    Continue Quiz
                  </Button>
                  <Button
                    disabled={isSubmitting}
                    onClick={() => submitQuiz(false)}
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {isSubmitting ? 'Scoring...' : 'Confirm Submit'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* 3. RESULTS & AUTOMATED FEEDBACK SYSTEM */}
      {/* ============================================================== */}
      {quizState === 'submitted' && feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Result Banner */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
            <div className={`h-4 ${feedback.passed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`} />
            <div className="p-8 md:p-12 space-y-8">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      feedback.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {feedback.passed ? 'Assessment Passed' : 'Needs Practice'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Completed in {Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {meta.title} Performance Report
                  </h2>
                  <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
                    {feedback.summary}
                  </p>
                </div>

                {/* Big Score Badge */}
                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm shrink-0">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-slate-900">
                      {feedback.percentage}%
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {feedback.overallScore} of {questions.length} Correct
                    </p>
                  </div>
                  <div className="h-12 w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-600">
                      Grade: {feedback.grade}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Target: 70%+
                    </p>
                  </div>
                </div>
              </div>

              {/* AUTOMATED FEEDBACK BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                {/* Topic Breakdown Card */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" /> Topic Mastery
                  </h4>
                  <div className="space-y-3">
                    {feedback.topicBreakdown.map((t, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate pr-2">{t.topic}</span>
                          <span>{t.percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              t.percentage >= 80
                                ? 'bg-emerald-500'
                                : t.percentage >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${t.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Strengths */}
                <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Strengths
                  </h4>
                  <ul className="space-y-2 text-xs text-emerald-800">
                    {feedback.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Recommendations */}
                <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={16} className="text-blue-600" /> Actionable Next Steps
                  </h4>
                  <ul className="space-y-2 text-xs text-blue-800">
                    {feedback.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  onClick={startQuiz}
                  className="rounded-xl px-6 bg-slate-900 hover:bg-blue-600 text-white font-bold flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Retake Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/skills')}
                  className="rounded-xl px-6 font-semibold"
                >
                  Return to Skill Tree
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/student/dashboard')}
                  className="rounded-xl px-4 text-slate-500 font-semibold"
                >
                  Dashboard
                </Button>
              </div>

            </div>
          </Card>

          {/* DETAILED QUESTION-BY-QUESTION REVIEW */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Detailed Answer Key & Explanations</h3>
                <p className="text-sm text-slate-500">Review your choices and deep dive into the technical rationale.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
                {(['all', 'incorrect', 'correct', 'flagged'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setReviewFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      reviewFilter === tab
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Review List */}
            <div className="space-y-4">
              {filteredReviewQuestions.map(q => {
                const studentAns = answers[q.originalIndex]
                const isCorrect = studentAns === q.correctIndex
                const wasAnswered = studentAns !== undefined

                return (
                  <Card key={q.id} className="rounded-3xl border-slate-200/80 shadow-md bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">#{q.originalIndex + 1}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {q.topic}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            <CheckCircle2 size={14} /> Correct
                          </span>
                        ) : wasAnswered ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            <XCircle size={14} /> Incorrect
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            Skipped
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900">{q.question}</h4>

                    {q.codeSnippet && (
                      <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                        <pre><code>{q.codeSnippet}</code></pre>
                      </div>
                    )}

                    {/* Options Breakdown */}
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isStudentChoice = studentAns === oIdx
                        const isCorrectChoice = q.correctIndex === oIdx

                        let borderClass = 'border-slate-100 bg-slate-50/50 text-slate-700'
                        if (isCorrectChoice) {
                          borderClass = 'border-emerald-300 bg-emerald-50/80 text-emerald-900 font-semibold'
                        } else if (isStudentChoice && !isCorrect) {
                          borderClass = 'border-rose-300 bg-rose-50/80 text-rose-900 line-through'
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center justify-between p-3 rounded-xl border text-sm ${borderClass}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold uppercase">{String.fromCharCode(65 + oIdx)}.</span>
                              <span>{opt}</span>
                            </div>
                            {isCorrectChoice && (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <Check size={14} /> Correct Answer
                              </span>
                            )}
                            {isStudentChoice && !isCorrectChoice && (
                              <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                <XCircle size={14} /> Your Choice
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Technical Explanation:
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </Card>
                )
              })}

              {filteredReviewQuestions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <p className="font-medium">No questions matched the "{reviewFilter}" filter.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
