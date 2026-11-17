'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateCoursePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    level: 'beginner',
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      toast.error('Course title is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          description: form.description.trim() || undefined,
          price: form.price ? Number(form.price) : 0,
          level: form.level,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not create course')
      toast.success('Draft course created')
      router.push(`/teacher/courses/${data.course.id}/content`)
    } catch (error: any) {
      toast.error(error?.message || 'Could not create course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div>
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Create a course draft
        </h1>
        <p className="text-sm text-slate-500">
          Start with the essentials. You will add sections, lessons, outcomes, and content blocks next.
        </p>
      </div>

      <form onSubmit={submit}>
        <Card className="rounded-2xl border border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base">Course essentials</CardTitle>
            <CardDescription>
              Drafts are hidden from students until you publish them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title *">
              <Input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="e.g. Full Stack Java with Spring Boot"
                required
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={form.subtitle}
                onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                placeholder="A short promise for the learner"
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="What the course covers and who it is for"
                className="w-full rounded-md border border-slate-200 p-3 text-sm"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (0 = free)">
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="0"
                />
              </Field>
              <Field label="Level">
                <select
                  value={form.level}
                  onChange={(event) => setForm({ ...form, level: event.target.value })}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create draft and continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  )
}
