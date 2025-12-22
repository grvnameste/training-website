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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      } else {
        setUser(data.user)
      }
    })
  }, [router])

  // close dropdown on outside click
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!user) return null

  const navItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Courses', icon: GraduationCap },
    { href: '/student/skills', label: 'Skills', icon: BookOpen },
    { href: '/student/result', label: 'Scorecard', icon: BarChart3 },
    { href: '/student/interview', label: 'Interview Prep', icon: Mic },
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold">ReadNRevise</span>
          </Link>

          {/* PROFILE DROPDOWN (only Profile now) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 hover:bg-slate-100"
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-600" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg">
                <button
                  onClick={() => {
                    setOpen(false)
                    router.push('/student/profile')
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
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
      <main className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        <aside className="w-64 bg-white rounded-xl p-4 flex flex-col">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    active
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* LOGOUT IN SIDE MENU */}
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        <section className="flex-1">{children}</section>
      </main>
    </div>
  )
}
