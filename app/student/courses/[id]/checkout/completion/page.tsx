//app/student/courses/[id]/checkout/completion/page.tsx
'use client'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function CompletionPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  return (
    <>
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
          onClick={() => router.push(`/student/courses/${courseId}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          Go to Course →
        </Button>

      </div>
      </div>
    </>
  )
  
}