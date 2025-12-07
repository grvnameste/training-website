'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BookOpen, Search, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
  enrollments: number
}

// --- Pathway types & weights (kept consistent with questionnaire) ---
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

// --- Helpers ---
const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

const computePathwayFromAnswers = (
  answersObj: Record<string, number> | undefined | null
) => {
  const defaultScores: Record<PathwayKey, number> = {
    'Cloud & Infrastructure': 0,
    'Business Analysis & Delivery': 0,
    'Data & Analytics': 0,
    'Automation / Low-Code': 0,
    'AI & Workflow Integration': 0,
  }
  if (!answersObj)
    return { top: null as PathwayKey | null, scores: defaultScores }
  const scores = { ...defaultScores }
  for (const q of Object.keys(answersObj)) {
    const val = Number(answersObj[q] ?? 0)
    const weights = careerQuestionWeights[q] || [0, 0, 0, 0, 0]
    pathwayKeys.forEach((pKey, idx) => {
      scores[pKey] += (weights[idx] || 0) * val
    })
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const top = sorted.length ? (sorted[0][0] as PathwayKey) : null
  return { top, scores }
}

// --- Component ---
export default function StudentDashboard() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')

  // questionnaire states
  const [questionnaireCareer, setQuestionnaireCareer] = useState<
    | null
    | {
        answers?: Record<string, number>
        openAnswers?: Record<string, string>
        computedAt?: string
        computedTop?: string | null
        scores?: Record<string, number>
      }
  >(null)
  const [questionnaireCulture, setQuestionnaireCulture] = useState<any>(null)
  const [questionnaireComputed, setQuestionnaireComputed] = useState<{
    top: PathwayKey | null
    scores: Record<PathwayKey, number>
  } | null>(null)

  useEffect(() => {
    // Load all courses
    const allCourses = safeParse(localStorage.getItem('lms_courses')) || []
    setCourses(allCourses)

    // Load current user and enforce questionnaire flow
    const currentUser = safeParse(localStorage.getItem('lms_current_user'))
    if (!currentUser) {
      router.push('/login')
      return
    }

    // If student and questionnaire not done -> redirect to questionnaire
    if (currentUser.role === 'student') {
      const q = localStorage.getItem(`questionnaire_${currentUser.email}`)
      if (!q) {
        router.push('/student/questionnaire')
        return
      }
    }

    // Load enrolled courses for this student (safe)
    const enrollments =
      safeParse(localStorage.getItem(`enrollments_${currentUser.email}`)) || []
    setEnrolledCourses(enrollments)

    // Load questionnaire data (career + culture) if present
    const career = safeParse(
      localStorage.getItem(`questionnaire_career_${currentUser.email}`)
    )
    const culture = safeParse(
      localStorage.getItem(`questionnaire_culture_${currentUser.email}`)
    )

    if (career) {
      const safeCareer = {
        answers: career.answers ?? {},
        openAnswers: career.openAnswers ?? {},
        computedAt: career.computedAt ?? undefined,
        computedTop: career.computedTop ?? null,
        scores: career.scores ?? {},
      }
      setQuestionnaireCareer(safeCareer)
      const computed = computePathwayFromAnswers(safeCareer.answers)
      setQuestionnaireComputed(computed)
    } else {
      setQuestionnaireCareer(null)
      setQuestionnaireComputed(null)
    }
    if (culture) setQuestionnaireCulture(culture)
    else setQuestionnaireCulture(null)
  }, [router])

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q)

    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'free' && course.price === 0) ||
      (priceFilter === 'paid' && course.price > 0)

    return matchesSearch && matchesPrice
  })

  const myCoursesCount = enrolledCourses.length

  // helper to safely render values that might be objects
  const renderSafe = (v: any) => {
    if (v === null || v === undefined) return '—'
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    )
      return String(v)
    try {
      return JSON.stringify(v)
    } catch {
      return String(v)
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero / Welcome Section */}
      <div className="rounded-3xl border border-border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-7 md:px-8 md:py-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/80">
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Welcome to Your Learning Dashboard
          </h1>
          <p className="text-base md:text-lg text-slate-200/85 max-w-xl">
            Explore courses and continue your learning journey
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="rounded-2xl bg-slate-800/80 px-4 py-3 text-right min-w-[180px]">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              My courses
            </p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {myCoursesCount}
            </p>
            <p className="text-xs text-slate-300/80">
              course{myCoursesCount !== 1 ? 's' : ''} in progress
            </p>
          </div>

          <Link href="/student/my-courses">
            <Button
              variant="outline"
              className="border-slate-500/60 bg-slate-900/40 text-slate-50 hover:bg-slate-800/80 hover:text-white"
            >
              Go to My Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* My Courses Stats (secondary card) */}
      {myCoursesCount > 0 && (
        <Card className="border border-primary/15 bg-primary/5 backdrop-blur-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base md:text-lg">
                My Enrolled Courses
              </CardTitle>
              <CardDescription className="text-sm text-primary/80">
                {myCoursesCount} course{myCoursesCount !== 1 ? 's' : ''} in
                progress
              </CardDescription>
            </div>
            <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/student/my-courses">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                View My Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Explore Courses
          </h2>
          <span className="text-xs md:text-sm text-foreground/60">
            {filteredCourses.length} course
            {filteredCourses.length !== 1 ? 's' : ''} available
          </span>
        </div>

        <Card className="border border-border/70 rounded-2xl">
          <CardContent className="pt-5 pb-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <Input
                  type="text"
                  placeholder="Search courses by title or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/40"
                />
              </div>
              <div className="flex items-center gap-2 md:w-56">
                <span className="text-xs text-foreground/60 whitespace-nowrap">
                  Price
                </span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/70"
                >
                  <option value="all">All</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div>
        {filteredCourses.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 rounded-3xl">
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No courses found
              </h3>
              <p className="text-foreground/70 max-w-sm mx-auto text-sm">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'More courses coming soon!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <StudentCourseCard
                key={course.id}
                course={course}
                isEnrolled={enrolledCourses.includes(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StudentCourseCard({
  course,
  isEnrolled,
}: {
  course: Course
  isEnrolled: boolean
}) {
  return (
    <Link href={`/student/courses/${course.id}`}>
      <Card className="group overflow-hidden border border-border/70 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer h-full flex flex-col">
        {/* Thumbnail */}
        <div className="w-full aspect-video bg-primary/5 relative overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail || '/placeholder.svg'}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary/30" />
            </div>
          )}
          {isEnrolled && (
            <div className="absolute top-3 right-3 bg-emerald-600 text-emerald-50 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              Enrolled
            </div>
          )}
        </div>

        <CardContent className="pt-4 pb-4 px-4 md:px-5 flex flex-col gap-3 flex-1">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm md:text-base">
              {course.title}
            </h3>
            <p className="text-[13px] md:text-sm text-foreground/70 line-clamp-2">
              {course.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs md:text-sm pt-1">
            <span className="inline-flex items-center gap-1 text-foreground/60">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              {course.enrollments} students enrolled
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 md:w-3.5 md:h-3.5 fill-accent text-accent"
                />
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-base md:text-lg font-semibold text-primary">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </p>
            <Button
              className={`h-9 px-4 text-xs md:text-sm rounded-full ${
                isEnrolled
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              disabled={isEnrolled}
            >
              {isEnrolled ? 'View Course' : 'Enroll Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
