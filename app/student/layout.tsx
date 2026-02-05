'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 h-[72px] bg-white border-b">
        <nav className="flex h-full items-center justify-between px-6">
        <Link
  href="/student/dashboard"
  className="flex items-center"
>
  <Image
    src="/assets/Readnrevise_logo.png"
    alt="ReadNRevise Logo"
    width={160}
    height={40}
    priority
  />
</Link>


          {/* USER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white hover:bg-slate-50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setOpen(false)
                    router.push('/student/profile')
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50"
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
        {/* ===== SIDEBAR (96px) ===== */}
        <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-[96px] bg-white border-r flex flex-col items-center py-4">
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
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-100'
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
            className="mt-4 w-12 h-12 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition"
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
