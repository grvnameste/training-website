<<<<<<< HEAD
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Sparkles,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type ExampleGuide = {
  framework: string
  outline: { label: string; text: string }[]
  sampleAnswer: string
  keyConcepts: string[]
}

type Question = {
  id: string
  text: string
  type: string
  tags: string
  guide: ExampleGuide
}

type Category = {
  id: string
  title: string
  questions: Question[]
}

type FeedbackReport = {
  score: number
  wordCount: number
  matchedConcepts: string[]
  missingConcepts: string[]
  hasStarStructure: boolean
  hasMetrics: boolean
  fillerCount: number
  strengths: string[]
  improvements: string[]
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
        guide: {
          framework: 'STAR Method (Situation · Task · Action · Result)',
          outline: [
            { label: 'Situation', text: 'Describe the project context and why the stakeholder was resistant or difficult.' },
            { label: 'Task', text: 'Clarify your responsibility to align scope, timeline, or requirements.' },
            { label: 'Action', text: 'Explain how you listened actively, used data/trade-offs, and reached consensus.' },
            { label: 'Result', text: 'Share measurable delivery impact and how the relationship improved.' },
          ],
          sampleAnswer:
            'In our Q3 billing portal revamp, a senior operations lead insisted on keeping 14 manual approval steps, which threatened our 6-week launch target. My task was to finalize requirements without delaying release or losing operational compliance. I scheduled a focused 30-minute discovery session to map their compliance risks, showed cycle-time data demonstrating a 40% bottleneck, and proposed automated audit logs covering 12 of the 14 checks. They agreed to pilot the streamlined flow, which cut invoice turnaround by 35% and became our standard SLA.',
          keyConcepts: ['stakeholder', 'listen', 'data', 'alignment', 'compromise', 'requirement', 'impact', 'result'],
        },
      },
      {
        id: 'q2',
        text: 'How do you prioritize requirements?',
        type: 'Interview Question',
        tags: 'Technical · Prioritization',
        guide: {
          framework: 'MoSCoW / RICE + Business Value vs. Effort',
          outline: [
            { label: 'Business Alignment', text: 'Anchor requirements to core OKRs, customer pain, and regulatory deadlines.' },
            { label: 'Frameworks', text: 'Apply MoSCoW (Must/Should/Could/Won’t) or RICE (Reach, Impact, Confidence, Effort).' },
            { label: 'Dependencies', text: 'Identify technical blockers and MVP critical-path items with engineering.' },
            { label: 'Validation', text: 'Sign off the ranked backlog transparently with product and engineering leads.' },
          ],
          sampleAnswer:
            'I start by aligning every requirement with business objectives and user impact. Next, I categorize items using MoSCoW for release boundaries and score competing features with RICE—Reach, Impact, Confidence, and Effort—alongside engineering estimates. For instance, on a recent onboarding redesign, scoring revealed that fixing SSO drop-off impacted 60% of enterprise signups with half the effort of custom dashboards, so we prioritized SSO in Sprint 1 and increased activation by 18%.',
          keyConcepts: ['moscow', 'rice', 'value', 'effort', 'impact', 'stakeholder', 'mvp', 'dependency', 'backlog'],
        },
      },
      {
        id: 'q3',
        text: 'What is the difference between Agile and Scrum?',
        type: 'Interview Question',
        tags: 'Technical · Methodology',
        guide: {
          framework: 'Philosophy vs. Concrete Framework',
          outline: [
            { label: 'Agile', text: 'An iterative mindset and set of 4 values and 12 principles focused on customer collaboration and adaptability.' },
            { label: 'Scrum', text: 'A specific lightweight framework implementing Agile with fixed-length Sprints, roles, and ceremonies.' },
            { label: 'Roles & Artifacts', text: 'Product Owner, Scrum Master, Developers; Product Backlog, Sprint Backlog, Increment.' },
          ],
          sampleAnswer:
            'Agile is the overarching philosophy—built around iterative delivery, customer feedback, and embracing change rather than rigid upfront plans. Scrum is one concrete framework used to practice Agile. It prescribes fixed-length Sprints (usually 1–4 weeks), defined accountabilities (Product Owner, Scrum Master, Developers), artifacts like the Product Backlog and Increment, and events such as Sprint Planning, Daily Standup, Review, and Retrospective.',
          keyConcepts: ['philosophy', 'framework', 'sprint', 'iterative', 'product owner', 'scrum master', 'backlog', 'ceremony', 'retrospective'],
        },
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
        guide: {
          framework: 'Shared Responsibility & Abstraction Layers',
          outline: [
            { label: 'IaaS (Infrastructure)', text: 'Rent raw compute, storage, and networking (e.g., AWS EC2); you manage OS, runtime, and app.' },
            { label: 'PaaS (Platform)', text: 'Managed runtime, scaling, and deployment platform (e.g., Vercel, Heroku, Cloud Run); you manage code and data.' },
            { label: 'SaaS (Software)', text: 'Complete end-user application delivered over the web (e.g., Gmail, Salesforce, Notion).' },
          ],
          sampleAnswer:
            'IaaS, PaaS, and SaaS represent increasing levels of cloud abstraction. With IaaS like AWS EC2, the provider manages physical hardware and virtualization while your team manages the OS, patches, and app runtime—giving maximum control. With PaaS like Google Cloud Run or Heroku, the OS and scaling infrastructure are managed so developers focus solely on code and data. With SaaS like Slack or Google Workspace, the entire product is ready-to-use over the browser with zero infrastructure maintenance.',
          keyConcepts: ['iaas', 'paas', 'saas', 'infrastructure', 'runtime', 'os', 'managed', 'control', 'ec2', 'application'],
        },
      },
      {
        id: 'q5',
        text: 'How would you design a scalable web application?',
        type: 'System Design Question',
        tags: 'Architecture · Scalability',
        guide: {
          framework: 'Traffic Flow · Caching · Horizontal Scaling · Reliability',
          outline: [
            { label: 'Edge & Routing', text: 'DNS, CDN for static assets, and Load Balancer distributing traffic across stateless app nodes.' },
            { label: 'Compute Scaling', text: 'Horizontal auto-scaling behind health checks, keeping servers stateless.' },
            { label: 'Data & Caching', text: 'Read replicas, indexing/sharding, Redis cache layer, and async queues for heavy jobs.' },
            { label: 'Observability', text: 'Centralized logs, latency metrics, rate limiting, and circuit breakers.' },
          ],
          sampleAnswer:
            'I would start at the edge with a CDN to cache static assets close to users and a load balancer routing traffic across stateless application servers inside an auto-scaling group. Session state and hot queries move into Redis to offload the primary relational database, which uses connection pooling, proper indexes, and read replicas for read-heavy endpoints. Long-running work like emails or media processing is decoupled onto a message queue with background workers, backed by metrics, alerts, and rate limiting.',
          keyConcepts: ['load balancer', 'cdn', 'cache', 'redis', 'stateless', 'database', 'replica', 'queue', 'auto-scaling', 'horizontal'],
        },
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
        guide: {
          framework: 'Scope · Purpose · Automation Strategy',
          outline: [
            { label: 'Re-testing (Confirmation)', text: 'Verifying a specific failed test case or bug fix passes under the same preconditions.' },
            { label: 'Regression Testing', text: 'Ensuring recent code changes or bug fixes did not break existing unaffected functionality.' },
            { label: 'Automation', text: 'Regression suites are prime candidates for CI/CD automation; re-testing targets the exact defect first.' },
          ],
          sampleAnswer:
            'Re-testing—also called confirmation testing—focuses specifically on a defect that failed earlier: after a developer fixes the bug, QA re-runs the exact same failing steps and test data to confirm the fix works. Regression testing is broader: we run existing automated and critical-path suites across related modules to ensure that the new fix or feature did not introduce unintended side effects elsewhere in the application.',
          keyConcepts: ['re-testing', 'regression', 'defect', 'bug', 'existing', 'side effect', 'automation', 'suite', 'verify'],
        },
      },
    ],
  },
]

const PRACTICE_STORAGE_KEY = 'student:interview_practice_v1'
const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'actually', 'literally', 'sort of', 'kind of', 'you know']

function analyzeAnswerText(text: string, question: Question): FeedbackReport {
  const cleaned = text.trim()
  const lower = cleaned.toLowerCase()
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean) : []
  const wordCount = words.length

  const matchedConcepts = question.guide.keyConcepts.filter((kw) => lower.includes(kw))
  const missingConcepts = question.guide.keyConcepts.filter((kw) => !lower.includes(kw))

  const hasStarStructure =
    /\b(situation|context|task|goal|action|i did|i built|i scheduled|result|outcome|impact)\b/i.test(cleaned) ||
    wordCount >= 45
  const hasMetrics = /(\d+%|\d+\s*(ms|s|sec|seconds|mins|minutes|hours|days|weeks|months|users|requests|x))/i.test(cleaned)

  let fillerCount = 0
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = lower.match(regex)
    if (matches) fillerCount += matches.length
  }

  let score = 20
  if (wordCount >= 30) score += 20
  if (wordCount >= 65) score += 15
  if (wordCount > 240) score -= 5 // slight brevity penalty for overly long answers
  const conceptRatio = question.guide.keyConcepts.length
    ? matchedConcepts.length / Math.min(5, question.guide.keyConcepts.length)
    : 0
  score += Math.min(30, Math.round(conceptRatio * 30))
  if (hasStarStructure) score += 10
  if (hasMetrics) score += 10
  score -= Math.min(10, fillerCount * 2)
  score = Math.max(0, Math.min(100, score))

  const strengths: string[] = []
  const improvements: string[] = []

  if (wordCount >= 55 && wordCount <= 190) {
    strengths.push(`Strong pacing (${wordCount} words) — concise yet thorough for a 60–90 second answer.`)
  } else if (wordCount < 35) {
    improvements.push(`Your answer is brief (${wordCount} words). Aim for 60–150 words with concrete context and details.`)
  } else if (wordCount > 220) {
    improvements.push(`At ${wordCount} words, try tightening your explanation around the core takeaway first.`)
  } else {
    strengths.push(`Good detail level (${wordCount} words).`)
  }

  if (matchedConcepts.length >= 3) {
    strengths.push(`Covered ${matchedConcepts.length} core concepts: ${matchedConcepts.slice(0, 4).join(', ')}.`)
  } else {
    improvements.push(
      `Include more domain keywords such as: ${missingConcepts.slice(0, 4).join(', ')}.`
    )
  }

  if (hasMetrics) {
    strengths.push('Included concrete numbers or measurable impact metrics.')
  } else {
    improvements.push('Add quantifiable outcomes (e.g., % improvement, latency reduction, time saved, or scale).')
  }

  if (hasStarStructure) {
    strengths.push('Demonstrated logical flow from context/problem to action and outcome.')
  } else {
    improvements.push('Structure your response clearly using Situation → Task → Action → Result.')
  }

  if (fillerCount > 2) {
    improvements.push(`Detected ${fillerCount} filler words/phrases (e.g., "um", "like", "basically"). Pause briefly instead.`)
  } else if (wordCount >= 20) {
    strengths.push('Clean delivery with minimal filler words.')
  }

  return {
    score,
    wordCount,
    matchedConcepts,
    missingConcepts,
    hasStarStructure,
    hasMetrics,
    fillerCount,
    strengths,
    improvements,
  }
}

export default function InterviewPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id)
  const [activeQuestionId, setActiveQuestionId] = useState(categories[0].questions[0].id)
  const [activeTab, setActiveTab] = useState<'example' | 'feedback'>('example')

  // Recording & transcription states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [transcriptByQuestion, setTranscriptByQuestion] = useState<Record<string, string>>({})
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<Record<string, FeedbackReport>>({})

  const liveVideoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const speechRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRACTICE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.transcripts) setTranscriptByQuestion(parsed.transcripts)
        if (parsed?.feedbacks) setFeedbackByQuestion(parsed.feedbacks)
      }
    } catch {
      // ignore storage errors
    }

    return () => {
      stopMediaTracks()
    }
  }, [])

  const persistPractice = (
    transcripts: Record<string, string>,
    feedbacks: Record<string, FeedbackReport>
  ) => {
    try {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify({ transcripts, feedbacks }))
    } catch {
      // ignore storage errors
    }
  }

  const stopMediaTracks = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (speechRef.current) {
      try {
        speechRef.current.stop()
      } catch {
        // ignore
      }
      speechRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setHasCamera(false)
  }

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return categories
    return categories
      .map((cat) => {
        const catMatches = cat.title.toLowerCase().includes(q)
        const matchedQuestions = catMatches
          ? cat.questions
          : cat.questions.filter(
              (item) =>
                item.text.toLowerCase().includes(q) ||
                item.type.toLowerCase().includes(q) ||
                item.tags.toLowerCase().includes(q)
            )
        return { ...cat, questions: matchedQuestions }
      })
      .filter((cat) => cat.questions.length > 0)
  }, [searchQuery])

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0]

  const activeQuestion =
    activeCategory.questions.find((q) => q.id === activeQuestionId) ??
    activeCategory.questions[0]

  const currentTranscript = transcriptByQuestion[activeQuestion.id] || ''
  const currentFeedback = feedbackByQuestion[activeQuestion.id] || null

  const selectQuestion = (catId: string, qId: string) => {
    if (isRecording) {
      toast.info('Stop your current recording before switching questions.')
      return
    }
    setActiveCategoryId(catId)
    setActiveQuestionId(qId)
    setMediaError(null)
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
      setRecordedUrl(null)
    }
  }

  const startRecording = async () => {
    setMediaError(null)
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
      setRecordedUrl(null)
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMediaError('Camera/microphone API is unavailable in this browser. You can type your answer below for instant feedback.')
      return
    }

    try {
      let stream: MediaStream
      let usingVideo = true
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      } catch {
        // Fallback to audio-only if camera isn't attached
        usingVideo = false
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      streamRef.current = stream
      setHasCamera(usingVideo)

      if (usingVideo && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream
        liveVideoRef.current.muted = true
        await liveVideoRef.current.play().catch(() => {})
      }

      chunksRef.current = []
      const mimeType =
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : ''

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blobType = usingVideo ? 'video/webm' : 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: blobType })
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
        stopMediaTracks()
      }

      recorder.start(250)
      setIsRecording(true)
      setRecordingSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1)
      }, 1000)

      // Optional Web Speech API live transcription
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRec) {
        try {
          const recognition = new SpeechRec()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'
          const baseText = transcriptByQuestion[activeQuestion.id]?.trim() || ''
          recognition.onresult = (event: any) => {
            let finalSegment = ''
            let interimSegment = ''
            for (let i = 0; i < event.results.length; i++) {
              const part = event.results[i][0].transcript
              if (event.results[i].isFinal) finalSegment += part + ' '
              else interimSegment += part
            }
            const combined = [baseText, finalSegment.trim(), interimSegment.trim()]
              .filter(Boolean)
              .join(' ')
            setTranscriptByQuestion((prev) => ({
              ...prev,
              [activeQuestion.id]: combined,
            }))
          }
          recognition.start()
          speechRef.current = recognition
        } catch {
          // Live speech transcription optional
        }
      }

      toast.success('Recording started! Speak clearly into your microphone.')
    } catch (err: any) {
      setMediaError(
        err?.name === 'NotAllowedError'
          ? 'Microphone/camera permission denied. You can still type your answer below and run feedback analysis.'
          : 'Unable to access microphone/camera right now. You can type your response below for instant feedback.'
      )
      stopMediaTracks()
    }
  }

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    } else {
      stopMediaTracks()
    }
    setIsRecording(false)

    // Auto-analyze if transcript already captured
    const text = (transcriptByQuestion[activeQuestion.id] || '').trim()
    if (text.length >= 10) {
      const report = analyzeAnswerText(text, activeQuestion)
      const nextFeedbacks = { ...feedbackByQuestion, [activeQuestion.id]: report }
      setFeedbackByQuestion(nextFeedbacks)
      persistPractice(transcriptByQuestion, nextFeedbacks)
      setActiveTab('feedback')
    }
    toast.success('Recording stopped! Review your playback or analyze your answer.')
  }

  const handleAnalyzeAnswer = () => {
    const text = (transcriptByQuestion[activeQuestion.id] || '').trim()
    if (text.length < 15) {
      toast.error('Please record or write at least a short response (15+ characters) before analyzing.')
      return
    }
    const report = analyzeAnswerText(text, activeQuestion)
    const nextFeedbacks = { ...feedbackByQuestion, [activeQuestion.id]: report }
    setFeedbackByQuestion(nextFeedbacks)
    persistPractice(transcriptByQuestion, nextFeedbacks)
    setActiveTab('feedback')
    toast.success(`Answer scored ${report.score}% — feedback ready!`)
  }

  const resetAttempt = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
      setRecordedUrl(null)
    }
    const nextTranscripts = { ...transcriptByQuestion, [activeQuestion.id]: '' }
    setTranscriptByQuestion(nextTranscripts)
    setRecordingSeconds(0)
    persistPractice(nextTranscripts, feedbackByQuestion)
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Interview Preparation
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Practice interview questions, record video/audio answers, draft notes, and get structured feedback on clarity, STAR flow, and technical depth.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
            Practiced: {Object.keys(feedbackByQuestion).length} /{' '}
            {categories.reduce((acc, c) => acc + c.questions.length, 0)} questions
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1.5fr_1.15fr]">
          {/* LEFT: QUESTION BANK & LIVE SEARCH */}
          <Card className="rounded-xl border bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions, skills, or roles…"
                  aria-label="Search interview questions"
                  className="w-full rounded-lg border py-2 pl-9 pr-8 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {filteredCategories.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center space-y-2">
                  <p className="text-sm text-slate-500">
                    No questions match &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div key={category.id} className="rounded-lg bg-slate-50 p-3">
                    <button
                      type="button"
                      className="mb-2 w-full text-left text-sm font-semibold text-blue-700"
                      onClick={() => {
                        if (category.questions[0]) {
                          selectQuestion(category.id, category.questions[0].id)
                        }
                      }}
                    >
                      {category.title} ({category.questions.length})
                    </button>

                    <div className="space-y-2">
                      {category.questions.map((q) => {
                        const isActive = q.id === activeQuestion.id
                        const practicedScore = feedbackByQuestion[q.id]?.score
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => selectQuestion(category.id, q.id)}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                              isActive
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div className="line-clamp-2 font-medium">{q.text}</div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                              <span>{q.tags}</span>
                              {practicedScore !== undefined && (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3" /> {practicedScore}%
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* MIDDLE: PROMPT, RECORDER & ANSWER DRAFT */}
          <div className="space-y-4">
            <Card className="rounded-xl border bg-white shadow-sm">
              <CardHeader>
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                  {activeCategory.title} · {activeQuestion.type}
                </p>
                <CardTitle className="text-lg">{activeQuestion.text}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <CardContent className="p-5 space-y-4">
                {mediaError && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                    <span>{mediaError}</span>
                  </div>
                )}

                {/* LIVE VIDEO / RECORDING PLAYBACK AREA */}
                {isRecording ? (
                  <div className="relative rounded-xl bg-slate-900 overflow-hidden min-h-[200px] flex flex-col items-center justify-center">
                    <video
                      ref={liveVideoRef}
                      playsInline
                      muted
                      className={`w-full max-h-[260px] object-cover ${hasCamera ? 'block' : 'hidden'}`}
                    />
                    {!hasCamera && (
                      <div className="flex flex-col items-center gap-2 py-10 text-white">
                        <div className="h-14 w-14 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center animate-pulse">
                          <Mic className="w-6 h-6 text-red-400" />
                        </div>
                        <p className="text-sm font-medium">Recording Audio Answer…</p>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimer(recordingSeconds)}
                    </div>
                  </div>
                ) : recordedUrl ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Your Recorded Playback ({formatTimer(recordingSeconds)})
                    </p>
                    <video
                      src={recordedUrl}
                      controls
                      className="w-full max-h-[240px] rounded-xl bg-slate-900"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-sm text-slate-600 text-center max-w-sm">
                      Click &ldquo;Start Recording&rdquo; to practice on camera/mic, or type your response below for instant rubric feedback.
                    </p>
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <Video className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* TRANSCRIPT / WRITTEN RESPONSE AREA */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Answer Transcript / Notes
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {currentTranscript.trim() ? currentTranscript.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>
                  <Textarea
                    rows={4}
                    value={currentTranscript}
                    onChange={(e) => {
                      const next = { ...transcriptByQuestion, [activeQuestion.id]: e.target.value }
                      setTranscriptByQuestion(next)
                      persistPractice(next, feedbackByQuestion)
                    }}
                    placeholder="Speech transcription appears here automatically when supported, or write your practice answer directly..."
                    className="rounded-xl bg-white border-slate-200 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2.5">
              {!isRecording ? (
                <Button
                  type="button"
                  onClick={startRecording}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-400" />
                  {recordedUrl ? 'Record Again' : 'Start Recording'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Square className="w-3.5 h-3.5 mr-2 fill-current" />
                  Stop Recording ({formatTimer(recordingSeconds)})
                </Button>
              )}

              <Button
                type="button"
                onClick={handleAnalyzeAnswer}
                variant="outline"
                className="rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Answer
              </Button>

              <Button
                type="button"
                onClick={() => setActiveTab('example')}
                variant="outline"
                className="rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                View Example
              </Button>

              {(recordedUrl || currentTranscript) && !isRecording && (
                <Button
                  type="button"
                  onClick={resetAttempt}
                  variant="ghost"
                  className="rounded-full text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Clear
                </Button>
              )}
            </div>

            {!isRecording && hasCamera && (
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <VideoOff className="w-3.5 h-3.5" />
                <MicOff className="w-3.5 h-3.5" />
                <span>Camera & microphone stopped cleanly</span>
              </div>
            )}
          </div>

          {/* RIGHT: EXAMPLE ANSWER & EVALUATION FEEDBACK */}
          <Card className="rounded-xl border bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex border-b text-sm">
                {(['example', 'feedback'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 transition ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'example' ? 'Example Answer' : 'Answer Feedback'}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="max-h-[520px] overflow-y-auto text-sm text-slate-700 space-y-4">
              {activeTab === 'example' ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Recommended Structure
                    </p>
                    <p className="text-xs text-blue-900 mt-1 font-medium">
                      {activeQuestion.guide.framework}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {activeQuestion.guide.outline.map((step) => (
                      <div key={step.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-900">{step.label}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      High-Scoring Sample Answer
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 italic">
                      &ldquo;{activeQuestion.guide.sampleAnswer}&rdquo;
                    </p>
                  </div>
                </div>
              ) : currentFeedback ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white p-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">
                        Readiness Score
                      </p>
                      <p className="text-2xl font-black">{currentFeedback.score}%</p>
                    </div>
                    <div className="text-right text-xs text-slate-300 space-y-0.5">
                      <p>{currentFeedback.wordCount} words</p>
                      <p>{currentFeedback.matchedConcepts.length} key concepts</p>
                    </div>
                  </div>

                  {currentFeedback.strengths.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Strengths
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {currentFeedback.strengths.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentFeedback.improvements.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        Actionable Improvements
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {currentFeedback.improvements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Key Concepts Checklist
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuestion.guide.keyConcepts.map((kw) => {
                        const hit = currentFeedback.matchedConcepts.includes(kw)
                        return (
                          <span
                            key={kw}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              hit
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {hit ? '✓ ' : ''}
                            {kw}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-blue-500 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 text-sm">
                      No feedback generated yet
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Record your spoken answer or type your response in the middle panel, then click &ldquo;Analyze Answer&rdquo; for a rubric breakdown.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
=======
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
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
