//app/student/Layout.tsx
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
  Menu,
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/student/courses', icon: GraduationCap, label: 'Courses' },
    { href: '/student/skills', icon: BookOpen, label: 'Skills' },
    { href: '/student/activity', icon: Activity, label: 'Activity' },
    { href: '/student/result', icon: BarChart3, label: 'Result' },
    { href: '/student/interview', icon: Mic, label: 'Interview' },
    { href: '/student/resume', icon: FileText, label: 'Resume' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 h-[72px] bg-white border-b">
        <nav className="flex h-full items-center justify-between px-6">
          <Link href="/student/dashboard" className="flex items-center">
            <Image
              src="/assets/Readnrevise_logo.png"
              alt="ReadNRevise Logo"
              width={160}
              height={40}
              priority
            />
          </Link>

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
          </div>
        </nav>
      </header>

      {/* BODY */}
      <div className="flex">
        {/* SIDEBAR */}
        <aside
          className={`border-r bg-white min-h-[calc(100vh-72px)] transition-all duration-300
          ${
            sidebarOpen
              ? 'w-[240px] px-4 py-6'
              : 'w-[60px] px-2 py-4 overflow-hidden'
          }`}
        >
          {/* TOGGLE BUTTON */}
          <div
            className={`flex items-center mb-4 ${
              sidebarOpen ? 'justify-between' : 'justify-center'
            }`}
          >
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-md hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* NAV */}
          <div className="overflow-hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map(item => {
                const Icon = item.icon
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/')

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-2 rounded-lg transition px-2 py-2
                      ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }
                      ${
                        sidebarOpen
                          ? 'justify-start'
                          : 'justify-center'
                      }`}
                    >
                      <Icon className="w-5 h-5" />

                      <span
                        className={`${sidebarOpen ? 'inline' : 'hidden'}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className={`mt-4 flex items-center gap-2 rounded-lg px-2 py-2 text-red-500 hover:bg-red-50 transition
            ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <LogOut className="w-5 h-5" />
            <span className={`${sidebarOpen ? 'inline' : 'hidden'}`}>
              Logout
            </span>
          </button>
        </aside>

        {/* CONTENT */}
<main className="flex-1 px-4 py-8">{children}</main>
      </div>
    </div>
  )
}