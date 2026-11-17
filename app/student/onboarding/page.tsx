'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type Recommendation = {
  id: string
  title: string
  subtitle: string | null
  thumbnailUrl: string | null
  price: number
  level: string
  tags: string[]
  reason: string
}

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [form, setForm] = useState({
    goal: '',
    level: 'beginner',
    weeklyMinutes: '180',
    preferredTopics: [] as string[],
  })

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [prefRes, catalogRes] = await Promise.all([
          fetch('/api/me/preferences', { cache: 'no-store' }),
          fetch('/api/catalog/courses?limit=60', { cache: 'no-store' }),
        ])
        const prefData = await prefRes.json().catch(() => ({}))
        const catalogData = await catalogRes.json().catch(() => ({}))

        if (!active) return

        const preferences = prefData.preferences
        if (preferences) {
          setForm({
            goal: preferences.goal ?? '',
            level: preferences.level ?? 'beginner',
            weeklyMinutes: preferences.weeklyMinutes ? String(preferences.weeklyMinutes) : '180',
            preferredTopics: preferences.preferredTopics ?? [],
          })
        }

        const topicSet = new Set<string>()
        for (const course of catalogData.courses ?? []) {
          for (const tag of course.tags ?? []) topicSet.add(tag)
        }
        setTopics([...topicSet].slice(0, 16))
      } catch (error) {
        console.error('Onboarding load failed:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const toggleTopic = (topic: string) => {
    setForm((prev) => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter((item) => item !== topic)
        : [...prev.preferredTopics, topic],
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: form.goal || null,
          level: form.level,
          weeklyMinutes: form.weeklyMinutes ? Number(form.weeklyMinutes) : null,
          preferredTopics: form.preferredTopics,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save preferences')

      const recRes = await fetch('/api/me/recommendations', { cache: 'no-store' })
      const recData = await recRes.json().catch(() => ({}))
      setRecommendations(recData.recommendations ?? [])
      toast.success('Your learning path is personalized')
    } catch (error: any) {
      toast.error(error?.message || 'Could not save preferences')
    } finally {
      setSaving(false)
    }
  }

  const suggestedTopics = useMemo(
    () => topics.filter((topic) => !form.preferredTopics.includes(topic)).slice(0, 12),
    [topics, form.preferredTopics]
  )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Optional onboarding
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Personalize your learning
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tell us what you want to build. This never locks courses — it only improves recommendations.
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/student/dashboard')}>
          Skip for now
        </Button>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">Your goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              What do you want to become?
            </span>
            <Input
              value={form.goal}
              onChange={(event) => setForm({ ...form, goal: event.target.value })}
              placeholder="e.g. Full-stack Java developer"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current level
              </span>
              <select
                value={form.level}
                onChange={(event) => setForm({ ...form, level: event.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Weekly study time (minutes)
              </span>
              <Input
                type="number"
                min={30}
                max={3000}
                value={form.weeklyMinutes}
                onChange={(event) => setForm({ ...form, weeklyMinutes: event.target.value })}
              />
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Topics you want to learn
            </p>
            <div className="flex flex-wrap gap-2">
              {form.preferredTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {topic} ×
                </button>
              ))}
              {suggestedTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
                >
                  + {topic}
                </button>
              ))}
              {topics.length === 0 && (
                <p className="text-sm text-slate-400">
                  Topic suggestions appear as instructors tag published courses.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Save and view recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Recommended next steps</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {recommendations.map((course) => (
              <Card key={course.id} className="rounded-2xl border border-slate-200 bg-white">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">
                      {course.level}
                    </span>
                    <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-500">{course.subtitle || course.reason}</p>
                  <p className="text-xs font-medium text-emerald-700">{course.reason}</p>
                  <Link href={`/student/courses/${course.id}`}>
                    <Button variant="outline" className="w-full">
                      View course <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && (
        <Card className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            <p className="text-sm text-slate-600">
              Preferences saved. Recommendations will appear here when matching courses are available.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
