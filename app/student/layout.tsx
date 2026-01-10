'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Mic,
  BarChart3,
  User,
  ChevronDown,
  Activity,
  FileText,
} from 'lucide-react'
import supabase from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /* AUTH CHECK */
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/login')
        return
      }

      const role = data.user.user_metadata?.role

      // ✅ student-only guard
      if (role !== 'student') {
        router.replace('/teacher/dashboard')
        return
      }

      setUser(data.user)
    }

    checkUser()
  }, [router])

  /* CLOSE DROPDOWN */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* LOGOUT */
  const handleLogout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      await supabase.from('student_activity').insert({
        student_id: session.user.id,
        type: 'LOGOUT',
      })
    }

    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!user) return null

  const navItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Courses', icon: GraduationCap },
    { href: '/student/skills', label: 'Skills', icon: BookOpen },
    { href: '/student/activity', label: 'Activity', icon: Activity },
    { href: '/student/result', label: 'Scorecard', icon: BarChart3 },
    { href: '/student/interview', label: 'Interview Prep', icon: Mic },
    { href: '/student/resume', label: 'Resume Builder', icon: FileText },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b0f2a] via-[#120c2f] to-background">
      {/* glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur bg-background/70 border-b">
        <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 font-bold"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow">
              <BookOpen className="w-5 h-5" />
            </div>
            ReadNRevise
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-background hover:bg-muted"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border bg-background shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    setOpen(false)
                    router.push('/student/profile')
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* BODY */}
      <main className="relative w-full mx-auto px-6 py-8 flex gap-6">
        {/* SIDEBAR */}
        <aside className="w-64 rounded-3xl border bg-background/85 backdrop-blur shadow-xl p-4 flex flex-col">
          <nav className="space-y-1 flex-1">
            {navItems.map(item => {
              const Icon = item.icon
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
                    active
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        {/* CONTENT */}
        <section className="flex-1">{children}</section>
      </main>
    </div>
  )
}
