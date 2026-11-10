'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Mic,
  BarChart3,
  ChevronDown,
  Activity,
  FileText,
  Menu,
  ChevronLeft,
} from 'lucide-react'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) router.replace('/login')
  }, [user, isLoaded, router])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }

  if (!isLoaded || !user) return null

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-[60] h-[70px] bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <nav className="flex h-full items-center justify-between px-8">
          <Link href="/student/dashboard" className="flex items-center hover:opacity-80 transition">
            <Image
              src="/assets/Readnrevise_logo.png"
              alt="ReadNRevise Logo"
              width={140}
              height={35}
              priority
            />
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(prev => !prev)}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-1.5 pr-3 bg-white hover:border-blue-400 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-200">
                {user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-700 leading-none truncate max-w-[100px]">
                   {user?.fullName || 'Student'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Simple Dropdown for Logout */}
            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            )}
          </div>
        </nav>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside
          className={`sticky top-[70px] h-[calc(100vh-70px)] bg-white border-r border-slate-200/60 transition-all duration-400 ease-in-out z-40
          ${sidebarOpen ? 'w-[260px]' : 'w-[80px]'}`}
        >
          <div className="flex flex-col h-full py-6 px-4">
            
            {/* Toggle Button */}
            <div className={`mb-8 flex ${sidebarOpen ? 'justify-end' : 'justify-center'}`}>
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100"
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5">
              {navItems.map(item => {
                const Icon = item.icon
                const active = pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <Link key={item.href} href={item.href} title={item.label}>
                    <div
                      className={`group flex items-center gap-3 rounded-xl transition-all duration-200 px-3 py-3 relative
                      ${active 
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                      ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                    >
                      {/* Active Indicator Line */}
                      {active && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                      )}
                      
                      <Icon className={`w-[22px] h-[22px] transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                      
                      {sidebarOpen && (
                        <span className="text-[14px] tracking-tight">{item.label}</span>
                      )}
                      
                      {/* Tooltip for collapsed mode */}
                      {!sidebarOpen && (
                        <div className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                            {item.label}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Section / Logout */}
            <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                onClick={handleLogout}
                className={`w-full group flex items-center gap-3 rounded-xl px-3 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200
                ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                >
                <LogOut className="w-[22px] h-[22px]" />
                {sidebarOpen && <span className="text-[14px] font-medium">Sign Out</span>}
                </button>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0">
            <div className="max-w-[1400px] mx-auto p-6 md:p-10">
                {children}
            </div>
        </main>
      </div>
    </div>
  )
}