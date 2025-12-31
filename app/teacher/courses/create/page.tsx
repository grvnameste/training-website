// app/teacher/courses/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, ChevronDown, X, Upload } from 'lucide-react'

/* =======================
   TYPES
======================= */
type Lesson = {
  id: string
  title: string
  description: string
  duration: string
  videoName?: string
}

type Section = {
  id: string
  title: string
  lessons: Lesson[]
}

/* =======================
   FIELD WRAPPER
======================= */
const Field = ({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-blue-900">
      {label}
    </label>
    {children}
    {hint && (
      <p className="text-xs text-blue-700/70">{hint}</p>
    )}
  </div>
)

export default function CreateCoursePage() {
  const router = useRouter()

  /* Course Info */
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  /* Curriculum */
  const [sections, setSections] = useState<Section[]>([])
  const [sectionTitle, setSectionTitle] = useState('')
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)

  /* Lesson form */
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [lessonVideo, setLessonVideo] = useState<File | null>(null)

  /* =======================
     HANDLERS
  ======================= */
  const addSection = () => {
    if (!sectionTitle.trim()) return
    setSections((prev) => [
      ...prev,
      { id: Date.now().toString(), title: sectionTitle, lessons: [] },
    ])
    setSectionTitle('')
  }

  const addLesson = (sectionId: string) => {
    if (!lessonTitle.trim()) return

    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  id: Date.now().toString(),
                  title: lessonTitle,
                  description: lessonDesc,
                  duration: '3:00',
                  videoName: lessonVideo?.name,
                },
              ],
            }
          : s
      )
    )

    setLessonTitle('')
    setLessonDesc('')
    setLessonVideo(null)
  }

  const removeLesson = (sectionId: string, lessonId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.filter((l) => l.id !== lessonId),
            }
          : s
      )
    )
  }

  /* =======================
     SUBMIT (LOCAL + HOSTED)
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return alert('Not authenticated')

    /* ---------- COMMON PAYLOAD FOR PRISMA ---------- */
    const prismaPayload = {
      title,
      subtitle,
      description,
      price: Number(price || 0),
      teacherId: auth.user.id,
      sections: sections.map((s) => ({
        title: s.title,
        lessons: s.lessons.map((l) => ({
          title: l.title,
          description: l.description,
          duration: l.duration,
        })),
      })),
    }

    /* =======================
       1️⃣ LOCAL DB (PRISMA)
    ======================= */
    const localRes = await fetch('/api/prisma/course/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prismaPayload),
    })

    if (!localRes.ok) {
      alert('❌ Local DB (Prisma) save failed')
      return
    }

    /* =======================
       2️⃣ HOSTED DB (SUPABASE)
    ======================= */
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        teacher_id: auth.user.id,
        title,
        subtitle,
        description,
        price: Number(price || 0),
      })
      .select()
      .single()

    if (error || !course) {
      alert(error?.message)
      return
    }

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i]

      const { data: section } = await supabase
        .from('sections')
        .insert({
          course_id: course.id,
          title: sec.title,
          order_index: i,
        })
        .select()
        .single()

      if (!section) continue

      for (let j = 0; j < sec.lessons.length; j++) {
        const lesson = sec.lessons[j]
        await supabase.from('lessons').insert({
          section_id: section.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          order_index: j,
        })
      }
    }

    alert('✅ Course saved locally + hosted')
    router.refresh()
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-5xl mx-auto space-y-12 px-4">
        <Link href="/teacher/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-900">
            Create New Course
          </h1>
          <p className="text-blue-700/70 mt-2 max-w-2xl">
            Fill course details and organize curriculum for students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Course Info */}
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/60 rounded-t-xl border-b border-blue-100">
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Shown on course landing page
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6 md:grid-cols-2">
              <Field label="Course Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <Field label="Subtitle">
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </Field>

              <Field label="Course Description">
                <textarea
                  className="w-full rounded-md border p-3 text-sm min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>

              <Field label="Price (₹)">
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/60 rounded-t-xl border-b border-blue-100">
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                Add sections and lessons
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Section title"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                />
                <Button type="button" onClick={addSection}>
                  Add Section
                </Button>
              </div>

              {sections.map((section) => {
                const open = openSectionId === section.id
                return (
                  <div
                    key={section.id}
                    className="rounded-xl border bg-white"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSectionId(open ? null : section.id)
                      }
                      className="flex w-full justify-between px-5 py-4"
                    >
                      <span>{section.title}</span>
                      <ChevronDown />
                    </button>

                    {open && (
                      <div className="px-5 py-4 space-y-4">
                        <Input
                          placeholder="Lesson title"
                          value={lessonTitle}
                          onChange={(e) =>
                            setLessonTitle(e.target.value)
                          }
                        />
                        <textarea
                          className="w-full border p-2"
                          placeholder="Lesson description"
                          value={lessonDesc}
                          onChange={(e) =>
                            setLessonDesc(e.target.value)
                          }
                        />
                        <Button
                          type="button"
                          onClick={() => addLesson(section.id)}
                        >
                          Add Lesson
                        </Button>

                        {section.lessons.map((l, i) => (
                          <div key={l.id} className="flex justify-between">
                            <span>
                              {i + 1}. {l.title}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                removeLesson(section.id, l.id)
                              }
                            >
                              <X />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Publish Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
