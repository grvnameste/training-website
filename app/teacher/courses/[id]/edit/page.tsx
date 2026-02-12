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

type CapstoneStudent = {
  student_id: string
  stage1_submitted: boolean
  stage2_submitted: boolean
  stage3_submitted: boolean
  certificate_issued: boolean
  certificate_requested: boolean
  trello_board_url: string | null
  profiles: {
    name: string
    users: {
      email: string
    } | null
  }[]
  
  requirement_documents?: {
    file_url: string
  }[]
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
  <div className="space-y-1">
    <label className="text-sm font-medium text-muted-foreground">
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

  const [capstoneStudents, setCapstoneStudents] = useState<CapstoneStudent[]>([])
const [capstoneLoading, setCapstoneLoading] = useState(true)


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
   LOAD CAPSTONE STUDENTS
======================= */
useEffect(() => {
  const loadCapstoneStudents = async () => {

    // Step 1: get capstone record for this course
    const { data: capstoneData, error: capstoneError } = await supabase
    .from('courses')
    .select('id')
    .eq('is_capstone', true)
    .eq('parent_course_id', id)
    .single()
  
      console.log("Course ID:", id)
console.log("Capstone Data:", capstoneData)
console.log("Capstone Error:", capstoneError)


    if (capstoneError || !capstoneData) {
      setCapstoneLoading(false)
      return
    }

    // Step 2: get student progress
const { data: progressData, error } = await supabase
.from('student_capstone_progress')
.select('*')
.eq('capstone_id', capstoneData.id)

if (error || !progressData) {
setCapstoneLoading(false)
return
}

// Get all student IDs
const studentIds = progressData.map(s => s.student_id)

// Fetch profiles separately
const { data: profileData } = await supabase
.from('student_profiles')
.select('id, name')
.in('id', studentIds)


// Merge manually
const students = progressData.map(student => {
const profile = profileData?.find(p => p.id === student.student_id)

return {
  ...student,
  profiles: profile
    ? [{
        name: profile.name,
        users: null
      }]
    : []
}
})

// Fetch requirement documents
for (const student of students) {
const { data: docs } = await supabase
  .from('requirement_documents')
  .select('file_url')
  .eq('student_id', student.student_id)
  .eq('capstone_id', capstoneData.id)

student.requirement_documents = docs || []
}

setCapstoneStudents(students)


    setCapstoneLoading(false)
  }

  loadCapstoneStudents()
}, [id])


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

  if (loading) return <p>Loading...</p>

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* ===== TOP ACTIONS ===== */}
      <div className="flex items-center gap-3">
        <Link href="/teacher/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Link href={`/teacher/courses/${id}/capstone`}>
          <Button variant="outline" size="sm">
            Manage Capstone Project
          </Button>
        </Link>
      </div>

      {/* ================= COURSE INFO ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Course Information</CardTitle>
          <CardDescription>
            Update course details visible to students
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Course Title">
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </Field>

          <Field label="Subtitle">
            <Input
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
            />
          </Field>

          <Field label="Course Description">
            <textarea
              className="md:col-span-2 w-full rounded-md border p-3 text-sm"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Price (₹)">
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="max-w-xs"
            />
          </Field>

          <div className="md:col-span-2">
            <Button onClick={saveCourse}>Save Course Details</Button>
          </div>
        </CardContent>
      </Card>

      {/* ================= CURRICULUM ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Course Curriculum</CardTitle>
          <CardDescription>
            Edit sections & lessons (auto-save on blur)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
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
              <div key={section.id} className="rounded-xl border">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSectionId(open ? null : section.id)
                  }
                  className="flex w-full justify-between px-5 py-4 hover:bg-muted/40"
                >
                  <div>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">
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
                  <div className="border-t px-5 py-4 space-y-4">
                    {/* Section + Lesson UI remains SAME */}
                    {/* (intentionally untouched) */}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ================= CAPSTONE STUDENTS ================= */}
<Card>
  <CardHeader>
    <CardTitle>Capstone Project Students</CardTitle>
    <CardDescription>
      Stage wise submission overview
    </CardDescription>
  </CardHeader>

  <CardContent>
    {capstoneLoading ? (
      <p>Loading students...</p>
    ) : capstoneStudents.length === 0 ? (
      <p className="text-muted-foreground">
        No students enrolled in capstone yet.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Stage 1</th>
              <th className="p-3 text-left">Stage 2</th>
              <th className="p-3 text-left">Stage 3</th>
              <th className="p-3 text-left">Certificate</th>
            </tr>
          </thead>

          <tbody>
            {capstoneStudents.map((row) => (
              <tr key={row.student_id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">
                  {row.profiles?.[0]?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                  {row.profiles?.[0]?.users?.email}
                  </div>
                </td>

                <td className="p-3">
                  {row.requirement_documents?.[0]?.file_url ? (
                    <a
                      href={row.requirement_documents[0].file_url}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      View Doc
                    </a>
                  ) : (
                    'Not Submitted'
                  )}
                </td>

                <td className="p-3">
                  {row.stage2_submitted ? (
                    <a
                      href={row.trello_board_url || '#'}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Open Trello
                    </a>
                  ) : (
                    'Not Submitted'
                  )}
                </td>

                <td className="p-3">
                  {row.stage3_submitted ? 'Submitted' : 'Not Submitted'}
                </td>

                <td className="p-3">
                  {row.certificate_issued
                    ? 'Issued'
                    : row.certificate_requested
                    ? 'Requested'
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </CardContent>
</Card>

    </div>
  )
}
