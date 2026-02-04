'use client'

import Courses from '@/components/courses'

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">
            Explore Courses
          </h1>
          <p className="mt-4 text-slate-600">
            Browse all available courses without logging in.
          </p>
        </div>

        <Courses />
      </div>
    </div>
  )
}
