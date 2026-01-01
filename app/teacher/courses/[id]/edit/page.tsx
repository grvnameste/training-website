'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ChevronDown, Plus, X, Trash2 } from 'lucide-react'

/* =======================
   TYPES
======================= */
type Lesson = {
  id: string
  title: string
  description: string
  duration: string
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
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-blue-900">
      {label}
    </label>
    {children}
  </div>
)

export default function EditCoursePage() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  /* Course Info */
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  /* Curriculum */
  const [sections, setSections] = useState<Section[]>([])
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)

  /* New Section */
  const [newSectionTitle, setNewSectionTitle] = useState('')

  /* New Lesson */
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')

  /* =======================
     LOAD COURSE
  ======================= */
  useEffect(() => {
    const loadCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          subtitle,
          description,
          price,
          sections (
            id,
            title,
            order_index,
            lessons (
              id,
              title,
              description,
              duration,
              order_index
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        alert('Course not found')
        router.push('/teacher/dashboard')
        return
      }

      setTitle(data.title)
      setSubtitle(data.subtitle || '')
      setDescription(data.description || '')
      setPrice(String(data.price || 0))

      setSections(
        data.sections
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .map((s: any) => ({
            id: s.id,
            title: s.title,
            lessons: s.lessons.sort(
              (a: any, b: any) => a.order_index - b.order_index
            ),
          })) || []
      )

      setLoading(false)
    }

    loadCourse()
  }, [id, router])

  /* =======================
     COURSE UPDATE
  ======================= */
  const saveCourse = async () => {
    const { error } = await supabase
      .from('courses')
      .update({
        title,
        subtitle,
        description,
        price: Number(price),
      })
      .eq('id', id)

    if (error) alert(error.message)
    else alert('✅ Course details updated')
  }

  /* =======================
     SECTION ACTIONS
  ======================= */
  const addSection = async () => {
    if (!newSectionTitle.trim()) return

    const { data, error } = await supabase
      .from('sections')
      .insert({
        course_id: id,
        title: newSectionTitle,
        order_index: sections.length,
      })
      .select()
      .single()

    if (error || !data) return alert(error?.message)

    setSections(prev => [...prev, { ...data, lessons: [] }])
    setNewSectionTitle('')
  }

  const saveSectionTitle = async (sectionId: string, value: string) => {
    await supabase.from('sections').update({ title: value }).eq('id', sectionId)
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section?')) return
    await supabase.from('sections').delete().eq('id', sectionId)
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }

  /* =======================
     LESSON ACTIONS
  ======================= */
  const addLesson = async (sectionId: string) => {
    if (!lessonTitle.trim()) return

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        section_id: sectionId,
        title: lessonTitle,
        description: lessonDesc,
        duration: '3:00',
      })
      .select()
      .single()

    if (error || !data) return alert(error?.message)

    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, data] }
          : s
      )
    )

    setLessonTitle('')
    setLessonDesc('')
  }

  const saveLessonField = async (
    lessonId: string,
    field: 'title' | 'description',
    value: string
  ) => {
    await supabase.from('lessons').update({ [field]: value }).eq('id', lessonId)
  }

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    await supabase.from('lessons').delete().eq('id', lessonId)
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
          : s
      )
    )
  }

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="max-w-5xl mx-auto space-y-12 px-4">
        <Link href="/teacher/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* ================= COURSE INFO ================= */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="bg-blue-50/60 rounded-t-xl border-b border-blue-100">
            <CardTitle>Edit Course Information</CardTitle>
            <CardDescription>
              Update course details visible to students
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            <Field label="Course Title">
              <Input
                className="focus-visible:ring-2 focus-visible:ring-blue-500"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </Field>

            <Field label="Subtitle">
              <Input
                className="focus-visible:ring-2 focus-visible:ring-blue-500"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
              />
            </Field>

            <Field label="Course Description">
              <textarea
                className="md:col-span-2 w-full rounded-md border p-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </Field>

            <Field label="Price (₹)">
              <Input
                type="number"
                className="max-w-xs focus-visible:ring-2 focus-visible:ring-blue-500"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </Field>

            <div className="md:col-span-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={saveCourse}>
                Save Course Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ================= CURRICULUM ================= */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="bg-blue-50/60 rounded-t-xl border-b border-blue-100">
            <CardTitle>Course Curriculum</CardTitle>
            <CardDescription>
              Edit sections & lessons (auto-save on blur)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                className="focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="New section title"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
              />
              <Button onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </div>

            {sections.map(section => {
              const open = openSectionId === section.id

              return (
                <div
                  key={section.id}
                  className="rounded-xl border border-blue-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSectionId(open ? null : section.id)
                    }
                    className="flex w-full justify-between px-5 py-4 hover:bg-blue-50 transition rounded-xl"
                  >
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        {section.title}
                      </h3>
                      <p className="text-xs text-blue-700/60">
                        {section.lessons.length} lessons
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="border-t border-blue-100 px-5 py-4 space-y-4">
                      <Field label="Section Title">
                        <Input
                          className="focus-visible:ring-2 focus-visible:ring-blue-500"
                          value={section.title}
                          onChange={e =>
                            setSections(prev =>
                              prev.map(s =>
                                s.id === section.id
                                  ? { ...s, title: e.target.value }
                                  : s
                              )
                            )
                          }
                          onBlur={e =>
                            saveSectionTitle(section.id, e.target.value)
                          }
                        />
                      </Field>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Section
                      </Button>

                      {/* ADD LESSON */}
                      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                        <Field label="Lesson Title">
                          <Input
                            className="focus-visible:ring-2 focus-visible:ring-blue-500"
                            value={lessonTitle}
                            onChange={e => setLessonTitle(e.target.value)}
                          />
                        </Field>

                        <Field label="Lesson Description">
                          <textarea
                            className="w-full rounded-md border p-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={lessonDesc}
                            onChange={e => setLessonDesc(e.target.value)}
                          />
                        </Field>

                        <Button
                          variant="secondary"
                          onClick={() => addLesson(section.id)}
                        >
                          Add Lesson
                        </Button>
                      </div>

                      {/* EXISTING LESSONS */}
                      {section.lessons.map((l, i) => (
                        <div
                          key={l.id}
                          className="rounded-lg border border-blue-100 bg-white p-4 space-y-3"
                        >
                          <Field label={`Lesson ${i + 1} Title`}>
                            <Input
                              className="focus-visible:ring-2 focus-visible:ring-blue-500"
                              value={l.title}
                              onChange={e =>
                                setSections(prev =>
                                  prev.map(s =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          lessons: s.lessons.map(lesson =>
                                            lesson.id === l.id
                                              ? {
                                                  ...lesson,
                                                  title: e.target.value,
                                                }
                                              : lesson
                                          ),
                                        }
                                      : s
                                  )
                                )
                              }
                              onBlur={e =>
                                saveLessonField(
                                  l.id,
                                  'title',
                                  e.target.value
                                )
                              }
                            />
                          </Field>

                          <Field label="Lesson Description">
                            <textarea
                              className="w-full rounded-md border p-2 text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={l.description || ''}
                              onChange={e =>
                                setSections(prev =>
                                  prev.map(s =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          lessons: s.lessons.map(lesson =>
                                            lesson.id === l.id
                                              ? {
                                                  ...lesson,
                                                  description:
                                                    e.target.value,
                                                }
                                              : lesson
                                          ),
                                        }
                                      : s
                                  )
                                )
                              }
                              onBlur={e =>
                                saveLessonField(
                                  l.id,
                                  'description',
                                  e.target.value
                                )
                              }
                            />
                          </Field>

                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() =>
                                deleteLesson(section.id, l.id)
                              }
                            >
                              <X className="h-4 w-4 mr-1" />
                              Delete Lesson
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
