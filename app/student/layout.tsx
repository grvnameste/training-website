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

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/login')
        return
      }

      const role = data.user.user_metadata?.role
      if (role !== 'student') {
        router.replace('/teacher/dashboard')
        return
      }

      setUser(data.user)
    }

    checkUser()
  }, [router])

  /* ================= CLOSE DROPDOWN ================= */
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

  /* ================= LOGOUT ================= */
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
    { href: '/student/dashboard', icon: LayoutDashboard },
    { href: '/student/courses', icon: GraduationCap },
    { href: '/student/skills', icon: BookOpen },
    { href: '/student/activity', icon: Activity },
    { href: '/student/result', icon: BarChart3 },
    { href: '/student/interview', icon: Mic },
    { href: '/student/resume', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      {/* GRID BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 bg-teal-400/20 blur-3xl rounded-full" />
      <div className="pointer-events-none fixed top-40 -right-40 h-96 w-96 bg-cyan-400/20 blur-3xl rounded-full" />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 h-[72px] backdrop-blur bg-black/40 border-b border-white/5">
        <nav className="flex h-full items-center justify-between px-6">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow">
              <BookOpen className="w-5 h-5 text-black" />
            </div>
            ReadNRevise
          </Link>

          {/* USER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 bg-white/5 hover:bg-white/10 transition"
            >
              <div className="w-8 h-8 rounded-full bg-teal-400 text-black flex items-center justify-center text-sm font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0b0f18] shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    setOpen(false)
                    router.push('/student/profile')
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-white/5"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex">
        {/* ===== SIDEBAR ===== */}
        <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-[96px] bg-black/40 backdrop-blur border-r border-white/5 flex flex-col items-center py-4">
          <nav className="flex-1 flex flex-col gap-2">
            {navItems.map(item => {
              const Icon = item.icon
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition
                    ${
                      active
                        ? 'bg-teal-400 text-black shadow-lg'
                        : 'text-white/60 hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              )
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-4 w-12 h-12 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </aside>

        {/* ===== CONTENT ===== */}
        <main className="ml-[96px] flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
