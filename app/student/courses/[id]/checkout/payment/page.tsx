//app/student/courses/[id]/checkout/payment/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreditCard, Lock } from 'lucide-react'
import { useUser } from "@/hooks/useUser"
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  price: number
  thumbnail_url: string | null
}

export default function PaymentStep() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const { user } = useUser()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Dummy form state
  const [cardName, setCardName] = useState('Test User')

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/catalog/courses/${courseId}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.course) {
        setCourse({
          id: data.course.id,
          title: data.course.title,
          price: data.course.price,
          thumbnail_url: data.course.thumbnailUrl,
        })
      }
      setLoading(false)
    }
    load()
  }, [courseId])

  const handleEnrollAndComplete = async () => {
    setProcessing(true)

    if (!user) {
      toast.error("Please sign in to complete enrollment")
      setProcessing(false)
      return
    }

    try {
      const res = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Enrollment failed')
      }

      toast.success('Successfully enrolled! Starting your course...')
      if (data.firstLessonId) {
        router.push(`/student/courses/${courseId}/play/${data.firstLessonId}`)
      } else {
        router.push(`/student/courses/${courseId}`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Enrollment failed")
      setProcessing(false)
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  if (!course) return null

  if (course.price > 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Paid enrollment</h1>
          <p className="mt-2 text-sm text-slate-600">
            Online payment is not enabled for this course. Contact your institute to request
            enrollment and an administrator will grant access.
          </p>
          <Button className="mt-5" onClick={() => router.push('/contact')}>
            Contact institute
          </Button>
        </div>
      </div>
    )
  }

  return (
    
  
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

      {/* LEFT — Payment Form */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Payment Details</h2>
              <p className="text-sm text-slate-400">Dummy form — no real payment needed</p>
            </div>
          </div>

          {/* Fake card form */}
          <div className="space-y-4">
            {/* Card Holder Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            {/* Card Number — static dummy */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Card Number</label>
              <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-400 flex items-center justify-between">
                <span>4242 4242 4242 4242</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-medium">TEST</span>
              </div>
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Expiry Date</label>
                <div className="border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-400">
                  12 / 29
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">CVV</label>
                <div className="border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-400">
                  •••
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>This is a dummy form. No actual payment will be processed.</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Order Summary */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 space-y-4">
          {/* Course card */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="aspect-video">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">No thumbnail</div>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold text-slate-800 text-sm leading-snug">{course.title}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3 text-sm">
            <p className="font-semibold text-slate-700">Price Details</p>
            <div className="flex justify-between text-slate-500">
              <span>1x {course.title}</span>
              <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-slate-900">
              <span>Total Amount</span>
              <span className="text-blue-600">{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
            </div>
          </div>

          <Button
            onClick={handleEnrollAndComplete}
            disabled={processing || !cardName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold rounded-xl disabled:opacity-60"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processing...
              </span>
            ) : (
              'Pay Now →'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push(`/student/courses/${courseId}/checkout/details`)}
            className="w-full text-slate-500"
          >
            ← Back to Details
          </Button>
        </div>
      </div>

    </div>
  )
}
