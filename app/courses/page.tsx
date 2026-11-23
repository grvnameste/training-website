'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Loader2, Search, Sparkles, X } from 'lucide-react'

type Course = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  price: number
  thumbnailUrl: string | null
  level: string
  estimatedMinutes: number | null
  tags: string[]
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set('q', searchQuery.trim())
        const res = await fetch(`/api/catalog/courses?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const data = await res.json().catch(() => ({}))
        if (active && res.ok) setCourses(data.courses ?? [])
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') console.error(error)
      } finally {
        if (active) setLoading(false)
      }
    }, 250)

    return () => {
      active = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative mb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600"
          >
            <Sparkles size={16} />
            <span>Outcome-led software training</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-6xl"
          >
            Master the <span className="text-blue-600">Tech Stack</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-lg leading-relaxed text-slate-500"
          >
            Structured lessons, practical projects, and measurable progress — designed for
            developers who want to build real software.
          </motion.p>

          <motion.form
            onSubmit={(event) => event.preventDefault()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-100 transition-all focus-within:border-blue-400"
          >
            <div className="pl-3 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title or technology…"
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-slate-400 hover:text-slate-700"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Search
            </button>
          </motion.form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">No courses match your search.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="block h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">
                        {course.level}
                      </span>
                      {course.estimatedMinutes && (
                        <span>
                          {course.estimatedMinutes < 60
                            ? `${course.estimatedMinutes}m`
                            : `${Math.round(course.estimatedMinutes / 60)}h`}
                        </span>
                      )}
                    </div>
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                      {course.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-slate-500">
                      {course.subtitle || course.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="font-semibold text-slate-900">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                      <span className="text-xs font-semibold text-blue-600">View course →</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
