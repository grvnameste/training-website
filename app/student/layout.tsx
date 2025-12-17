'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Mic,
  BarChart3,
} from 'lucide-react'
import supabase from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      } else {
        setUser(data.user)
      }
    })
  }, [router])

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
      <header className="sticky top-0 z-50 border-b bg-white">
        <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold">ReadNRevise</span>
          </Link>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        <aside className="w-64 bg-white rounded-xl p-4">
          <nav className="space-y-1">
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
        </aside>

        <section className="flex-1">{children}</section>
      </main>
    </div>
  )
}
