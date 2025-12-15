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
import { getCurrentUser, logout } from '@/lib/auth'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }, [router])

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Courses', icon: GraduationCap },
    { href: '/student/skills', label: 'Skills', icon: BookOpen },
    { href: '/student/result', label: 'Scorecard', icon: BarChart3 },
    { href: '/student/interview', label: 'Interview Prep', icon: Mic },
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">
              ReadNRevise
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Profile avatar */}
            <button
              onClick={() => router.push('/student/profile')}
              className="w-10 h-10 rounded-full overflow-hidden border border-slate-300 flex items-center justify-center bg-slate-50"
              title="View profile"
            >
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name || user.email || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-slate-700">
                  {(user?.name || user?.email || 'S')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </button>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </header>

      {/* Main + sidebar */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden md:flex md:flex-col w-64 rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            {/* User card */}
            <button
              type="button"
              onClick={() => router.push('/student/profile')}
              className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
                {(user?.name || user?.email || 'S')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  {user?.name || 'Student'}
                </span>
                <span className="text-xs text-slate-500">
                  ReadNRevise Student
                </span>
              </div>
            </button>

            {/* Navigation */}
            <nav className="mt-6 flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/')

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* CTA */}
            <button className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
              Upgrade Plan
            </button>
          </aside>

          {/* Page content */}
          <section className="flex-1">{children}</section>
        </div>
      </main>
    </div>
  )
}
