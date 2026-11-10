//app/teacher/courses/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useUser } from "@clerk/nextjs"
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


  const [hasCapstone, setHasCapstone] = useState(false)



  const { user } = useUser()
  console.log("USER ID:", user?.id)
  // ===== BOARD BUILDER STATE =====
const [boardName, setBoardName] = useState("")
const [boardLists, setBoardLists] = useState<any[]>([])
const [listTitle, setListTitle] = useState("")
const [cardInputs, setCardInputs] = useState<Record<string, string>>({})
// ===== BOARD FUNCTIONS =====
const addList = () => {
  if (!listTitle.trim()) return

  setBoardLists(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      title: listTitle,
      cards: []
    }
  ])

  setListTitle("")
}

const addCard = (listId: string) => {
  const value = cardInputs[listId]

  if (!value?.trim()) return

  setBoardLists(prev =>
    prev.map(l =>
      l.id === listId
        ? {
            ...l,
            cards: [
              ...l.cards,
              { id: crypto.randomUUID(), title: value }
            ]
          }
        : l
    )
  )

  setCardInputs(prev => ({
    ...prev,
    [listId]: ""
  }))
}

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
      if (!user) throw new Error('Not authenticated')

      /* Thumbnail */
      let thumbnailUrl: string | null = null
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(
          thumbnailFile,
          user.id
        )
      }

      /* Course */
     // 🔥 Clerk → UUID
const { data: uuid, error: uuidError } = await supabase.rpc('clerk_to_uuid', {
  clerk_id: user.id
})

if (uuidError) throw uuidError

const { data: course, error } = await supabase
  .from('courses')
  .insert({
    teacher_id: uuid,
    title,
    subtitle,
    description,
    price: Number(price || 0),
    thumbnail_url: thumbnailUrl,
    is_capstone: false,
    parent_course_id: null,
  })
  .select()
  .single()

      if (error || !course) throw error

    // ================= CREATE CAPSTONE COURSE =================
// ================= CREATE CAPSTONE COURSE =================
if (hasCapstone) {

  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('parent_course_id', course.id)
    .eq('is_capstone', true)
    .maybeSingle()

  if (!existing) {

    const { data: capstoneCourse, error: capstoneError } = await supabase
      .from('courses')
      .insert({
        teacher_id: uuid,
                title: `${title} – Capstone Project`,
        subtitle: 'Capstone Project',
        description: `Apply everything learned in ${title} through a real-world project.`,
        price: 0,
        thumbnail_url: thumbnailUrl,
        is_capstone: true,
        parent_course_id: course.id,
      })
      .select()
      .single()

    if (capstoneError || !capstoneCourse) {
      console.error(capstoneError)
      alert(capstoneError?.message)
      return
    }

    // ===== SAVE BOARD TEMPLATE =====
    const hasValidData = boardLists.some(l => l.cards.length > 0)

    if (hasValidData) {
      const { data: template, error: templateError } = await supabase
  .from("board_templates")
  .insert({
    capstone_id: capstoneCourse.id,
    name: boardName || "Default Board"
  })
  .select()
  .single()

  if (templateError || !template) {
    console.error("TEMPLATE ERROR:", templateError)
    alert("Board template create failed")
    return
  }
  
  console.log("TEMPLATE CREATED:", template)

  for (let i = 0; i < boardLists.length; i++) {
    const l = boardLists[i]
  
    const { data: newList, error: listError } = await supabase
      .from("template_lists")
      .insert({
        template_id: template.id,
        title: l.title,
        position: i
      })
      .select()
      .single()
  
    if (listError || !newList) {
      console.error("LIST ERROR:", listError)
      continue
    }
  
    for (let j = 0; j < l.cards.length; j++) {
      const { error: cardError } = await supabase
        .from("template_cards")
        .insert({
          list_id: newList.id,
          title: l.cards[j].title,
          position: j
        })
  
      if (cardError) {
        console.error("CARD ERROR:", cardError)
      }
    }
  }
    }

  }
}


      /* Sections + Lessons */
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i]

        const { data: section, error: sectionError } = await supabase
  .from('sections')
  .insert({
    course_id: course.id,
    title: sec.title,
    order_index: i,
  })
  .select()
  .single()

if (sectionError) {
  console.error("❌ SECTION ERROR:", sectionError)
  alert(sectionError.message)
  throw sectionError
}

        for (let j = 0; j < sec.lessons.length; j++) {
          const lesson = sec.lessons[j]

          let videoUrl: string | null = null
          if (lesson.videoFile) {
            videoUrl = await uploadVideo(
              lesson.videoFile,
              user.id
            )
          }

          const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            section_id: section.id,
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            order_index: j,
            video_url: videoUrl,
          })
        
        if (lessonError) {
          console.error("❌ LESSON ERROR:", lessonError)
          alert(lessonError.message)
          throw lessonError
        }
        }
      }

      alert('✅ Course Published successfully')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
  
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Create New Course
            </h1>
            <p className="text-sm text-slate-500">
              Build your course and define student journey
            </p>
          </div>
  
          <Link href="/teacher/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-8">
  
          {/* COURSE INFO */}
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-lg">
                📘 Course Information
              </CardTitle>
            </CardHeader>
  
            <CardContent className="grid gap-4 md:grid-cols-2">
  
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
  
              <div className="space-y-1">
                <label className="text-sm font-medium">Subtitle</label>
                <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
              </div>
  
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="border rounded-md p-2 w-full"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
  
              <div className="space-y-1">
                <label className="text-sm font-medium">Price</label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
  
              <div className="space-y-1">
                <label className="text-sm font-medium">Thumbnail</label>
                <Input type="file" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
              </div>
  
              {/* CAPSTONE TOGGLE */}
              <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Capstone Project</p>
                  <p className="text-xs text-slate-500">
                    Enable Capstone Project For Student
                  </p>
                </div>
  
                <input
                  type="checkbox"
                  checked={hasCapstone}
                  onChange={(e) => setHasCapstone(e.target.checked)}
                  className="h-5 w-5"
                />
              </div>
  
            </CardContent>
          </Card>
  
          {/* BOARD BUILDER */}
          {hasCapstone && (
            <Card className="shadow-md border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-700">
                  🧩 Project Board Setup
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Define workflow students will follow
                </p>
              </CardHeader>
  
              <CardContent className="space-y-6">
  
                <Input
                  placeholder="Board Name"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                />
  
                <div className="flex gap-2">
                  <Input
                    placeholder="Add Column"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                  />
                  <Button type="button" onClick={addList}>
                    + Column
                  </Button>
                </div>
  
                <div className="flex gap-4 overflow-x-auto">
                  {boardLists.map(list => (
                    <div
                      key={list.id}
                      className="bg-slate-100 rounded-xl p-3 min-w-[260px]"
                    >
                      <h3 className="font-semibold mb-2">{list.title}</h3>
  
                      <div className="flex gap-2 mb-2">
                      <Input
  placeholder="Task"
  value={cardInputs[list.id] || ""}
  onChange={(e) =>
    setCardInputs(prev => ({
      ...prev,
      [list.id]: e.target.value
    }))
  }
/>
<Button type="button" onClick={() => addCard(list.id)}>+</Button>                      </div>
  
                      {list.cards.map((c:any) => (
                        <div key={c.id} className="bg-white p-2 rounded text-sm mb-1 shadow">
                          {c.title}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
  
              </CardContent>
            </Card>
          )}
  
          {/* CURRICULUM */}
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle>📚 Curriculum</CardTitle>
            </CardHeader>
  
            <CardContent className="space-y-4">
  
              <div className="flex gap-2">
                <Input
                  placeholder="Section title"
                  value={sectionTitle}
                  onChange={e => setSectionTitle(e.target.value)}
                />
<Button type="button" onClick={addSection}>+ Section</Button>
              </div>
  
              {sections.map(section => (
                <div key={section.id} className="border rounded-xl">
  
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSectionId(openSectionId === section.id ? null : section.id)
                    }
                    className="flex w-full justify-between px-4 py-3 font-medium"
                  >
                    {section.title}
                    <ChevronDown />
                  </button>
  
                  {openSectionId === section.id && (
                    <div className="p-4 space-y-3">
  
                      <Input
                        placeholder="Lesson title"
                        value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                      />
  
                      <textarea
                        className="border p-2 w-full rounded-md"
                        placeholder="Lesson description"
                        value={lessonDesc}
                        onChange={e => setLessonDesc(e.target.value)}
                      />
  
                      <Input
                        type="file"
                        onChange={e => setLessonVideo(e.target.files?.[0] || null)}
                      />
  
  <Button type="button" onClick={() => addLesson(section.id)}>                        <Upload className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
  
                      {section.lessons.map((l, i) => (
                        <div key={l.id} className="flex justify-between text-sm">
                          {i + 1}. {l.title}
                          <Button size="icon" variant="ghost" onClick={() => removeLesson(section.id, l.id)}>
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
  
          {/* SUBMIT */}
          <div className="flex justify-end">
            <Button size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "🚀 Publish Course"
              )}
            </Button>
          </div>
  
        </form>
      </div>
    </div>
  )
}
