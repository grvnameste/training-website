'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  X,
  Upload,
  Loader2,
} from 'lucide-react'

/* =======================
   TYPES
======================= */
type Lesson = {
  id: string
  title: string
  description: string
  duration: string
  videoFile?: File | null
}

type Section = {
  id: string
  title: string
  lessons: Lesson[]
}

export default function CreateCoursePage() {
  const router = useRouter()

  /* =======================
     STATE
  ======================= */
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const [sections, setSections] = useState<Section[]>([])
  const [sectionTitle, setSectionTitle] = useState('')
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)

  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [lessonVideo, setLessonVideo] = useState<File | null>(null)

  /* =======================
     UPLOAD HELPERS
  ======================= */
  const uploadVideo = async (file: File, userId: string) => {
    const path = `${userId}/${crypto.randomUUID()}-${file.name}`

    const { error } = await supabase.storage
      .from('lesson-videos')
      .upload(path, file)

    if (error) throw error

    return supabase.storage
      .from('lesson-videos')
      .getPublicUrl(path).data.publicUrl
  }

  const uploadThumbnail = async (file: File, userId: string) => {
    const path = `${userId}/${crypto.randomUUID()}-${file.name}`

    const { error } = await supabase.storage
      .from('course-thumbnails')
      .upload(path, file)

    if (error) throw error

    return supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(path).data.publicUrl
  }

  /* =======================
     SECTION / LESSON
  ======================= */
  const addSection = () => {
    if (!sectionTitle.trim()) return

    setSections(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: sectionTitle,
        lessons: [],
      },
    ])

    setSectionTitle('')
  }

  const addLesson = (sectionId: string) => {
    if (!lessonTitle.trim()) return

    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                {
                  id: crypto.randomUUID(),
                  title: lessonTitle,
                  description: lessonDesc,
                  duration: '3:00',
                  videoFile: lessonVideo,
                },
              ],
            }
          : section
      )
    )

    setLessonTitle('')
    setLessonDesc('')
    setLessonVideo(null)
  }

  const removeLesson = (sectionId: string, lessonId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.filter(l => l.id !== lessonId),
            }
          : section
      )
    )
  }

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)

    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Not authenticated')

      /* Thumbnail */
      let thumbnailUrl: string | null = null
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(
          thumbnailFile,
          auth.user.id
        )
      }

      /* Course */
      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          teacher_id: auth.user.id,
          title,
          subtitle,
          description,
          price: Number(price || 0),
          thumbnail_url: thumbnailUrl,
        })
        .select()
        .single()

      if (error || !course) throw error

      /* Sections + Lessons */
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

          let videoUrl: string | null = null
          if (lesson.videoFile) {
            videoUrl = await uploadVideo(
              lesson.videoFile,
              auth.user.id
            )
          }

          await supabase.from('lessons').insert({
            section_id: section.id,
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            order_index: j,
            video_url: videoUrl,
          })
        }
      }

      alert('✅ Course published successfully')
      router.push('/teacher/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
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

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* COURSE INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <Input placeholder="Subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
              <textarea className="border p-2 md:col-span-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
              <Input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
              <Input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
            </CardContent>
          </Card>

          {/* CURRICULUM */}
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input placeholder="Section title" value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} />
                <Button type="button" onClick={addSection}>Add Section</Button>
              </div>

              {sections.map(section => (
                <div key={section.id} className="border rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOpenSectionId(openSectionId === section.id ? null : section.id)}
                    className="flex w-full justify-between px-5 py-4"
                  >
                    <span>{section.title}</span>
                    <ChevronDown />
                  </button>

                  {openSectionId === section.id && (
                    <div className="px-5 py-4 space-y-3">
                      <Input placeholder="Lesson title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
                      <textarea className="border p-2 w-full" placeholder="Lesson description" value={lessonDesc} onChange={e => setLessonDesc(e.target.value)} />
                      <Input type="file" accept="video/*" onChange={e => setLessonVideo(e.target.files?.[0] || null)} />

                      <Button type="button" onClick={() => addLesson(section.id)}>
                        <Upload className="mr-2 h-4 w-4" /> Add Lesson
                      </Button>

                      {section.lessons.map((l, i) => (
                        <div key={l.id} className="flex justify-between">
                          <span>{i + 1}. {l.title}</span>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeLesson(section.id, l.id)}>
                            <X />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Publish Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
