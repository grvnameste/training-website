//app/student/courses/[id]/checkout/details/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookOpen, GraduationCap, Clock, Star } from 'lucide-react'
interface Course {
  id: string
  title: string
  price: number
  description: string
  thumbnail_url: string | null
  teacher_id: string
  sections?: { id: string; title: string; lessons: { id: string; title: string }[] }[]
}

export default function DetailsStep() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, price, description, thumbnail_url, teacher_id')
        .eq('id', courseId)
        .single()

      const { data: sectionsData } = await supabase
        .from('sections')
        .select(`id, title, lessons(id, title)`)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })



      if (courseData) {
        setCourse({ ...courseData, sections: sectionsData || [] })
      }
      setLoading(false)
    }
    load()
  }, [courseId])

  const handleContinue = () => {
    router.push(`/student/courses/${courseId}/checkout/payment`)
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  if (!course) return <div className="text-center py-20 text-slate-500">Course not found.</div>

  const totalLessons = course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) ?? 0

  return (
  
<div className="max-w-2xl mx-auto space-y-6">    
      {/* LEFT — Course Preview */}
{/* 🔥 SINGLE CARD (IMAGE + INFO COMBINED) */}
<div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">

  {/* IMAGE */}
  <div className="rounded-xl overflow-hidden h-[160px] bg-slate-200">
    {course.thumbnail_url ? (
      <img
        src={course.thumbnail_url}
        alt={course.title}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="flex items-center justify-center w-full h-full">
        <GraduationCap className="w-12 h-12 text-slate-400" />
      </div>
    )}
  </div>

  {/* TITLE */}
  <h2 className="text-xl font-semibold text-slate-900">
    {course.title}
  </h2>

  {/* DESCRIPTION */}
  <p className="text-slate-600 text-sm leading-relaxed">
    {course.description}
  </p>

  {/* META */}
  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
    <span className="flex items-center gap-1.5">
      <BookOpen className="w-4 h-4" /> {totalLessons} Lessons
    </span>
    <span className="flex items-center gap-1.5">
      <Clock className="w-4 h-4" /> Lifetime Access
    </span>
    <span className="flex items-center gap-1.5">
      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Certificate
    </span>
  </div>

</div>


      {/* RIGHT — Order Summary + CTA */}

{/* 🔥 CARD 1 — COURSE SUMMARY */}
<div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
  <p className="text-xs uppercase tracking-widest text-slate-400">
    Order Summary
  </p>

  <h3 className="font-semibold text-lg text-slate-800 leading-snug">
    {course.title}
  </h3>

  <div className="flex justify-between text-sm text-slate-600">
    <span>1x Course</span>
    <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
  </div>
</div>

{/* 🔥 CARD 2 — PRICE + CTA */}
<div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">

  <div className="flex justify-between text-sm text-slate-600">
    <span>Subtotal</span>
    <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
  </div>

  <div className="flex justify-between text-sm text-slate-600">
    <span>Discount</span>
    <span className="text-green-600">—</span>
  </div>

  <div className="border-t pt-3 flex justify-between font-bold text-slate-900">
    <span>Total</span>
    <span className="text-blue-600">
      {course.price === 0 ? 'Free' : `₹${course.price}`}
    </span>
  </div>

  <Button
    onClick={handleContinue}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base font-semibold rounded-xl"
  >
    Continue to Payment →
  </Button>

  <p className="text-xs text-center text-slate-400">
    Secure checkout. No hidden charges.
  </p>
</div>

</div> 
  
  )


}