'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'

export default function CompletionPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  // ✅ INIT SUPABASE (MOST IMPORTANT)

  const [firstLessonId, setFirstLessonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔥 get first lesson
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const { data: sections, error } = await supabase
          .from('sections')
          .select(`
            id,
            lessons (
              id,
              order_index
            )
          `)
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })

        if (error) {
          console.error(error)
          return
        }

        const lessonId = sections?.[0]?.lessons?.[0]?.id
        setFirstLessonId(lessonId || null)

      } catch (err) {
        console.error("Error loading lessons:", err)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) load()
  }, [courseId, supabase])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center py-20 text-center">

        {/* ✅ ICON */}
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        {/* ✅ TEXT */}
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">
          Enrollment Successful
        </h1>

        <p className="text-slate-500 max-w-md mb-8">
          You now have full access to this course. Start learning anytime.
        </p>

        {/* ✅ CTA */}
        <Button
          disabled={loading}
          onClick={() => {
            if (firstLessonId) {
              router.push(`/student/courses/${courseId}/play/${firstLessonId}`)
            } else {
              router.push(`/student/courses/${courseId}`)
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          {loading ? "Loading..." : "Go to Course →"}
        </Button>

      </div>
    </div>
  )
}