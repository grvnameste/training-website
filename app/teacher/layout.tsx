<<<<<<< HEAD
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth, useUser } from "@/hooks/useUser"
import { canAccessInstructorPortal } from "@/lib/auth/roles"
import { NotificationBell } from '@/components/notifications/notification-bell'
import {
  CheckCircle,
  BookOpen,
  LogOut,
  ClipboardCheck,
  FolderKanban,
  Plus,
  LayoutDashboard,
  MessageSquare,
  Menu,
  ChevronLeft,
  ShieldCheck,
  UserCircle
} from 'lucide-react'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()
  
  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/login')
      return
    }
    if (!canAccessInstructorPortal(user.role, user.companies)) {
      router.push('/student/dashboard')
      return
    }
  }, [user, isLoaded, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (!isLoaded || !user) return null

  const navItems = [
    { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/teacher/courses', icon: BookOpen, label: 'Manage Courses' },
    { href: '/teacher/courses/create', icon: Plus, label: 'Create Course' },
    { href: '/teacher/reviews', icon: ClipboardCheck, label: 'Assignment Reviews' },
    { href: '/teacher/project-reviews', icon: FolderKanban, label: 'Project Reviews' },
    { href: '/teacher/capstone/approvals', icon: ClipboardCheck, label: 'Capstone Approvals' },
    { href: '/teacher/certificates', icon: CheckCircle, label: 'Certificates' },
    { href: '/teacher/chat', icon: MessageSquare, label: 'Inbox' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* TOP BAR */}
      <header className="sticky top-0 z-[60] h-16 bg-white border-b border-slate-200">
        <nav className="flex h-full items-center justify-between px-6 lg:px-8 gap-8">
          <Link href="/teacher/dashboard" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">ReadNRevise</span>
          </Link>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{user?.name || 'Administrator'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">Admin Console</span>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden md:block" />

            <NotificationBell className="h-9 w-9 rounded-lg" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside
          className={`sticky top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-200 ease-in-out z-40 shrink-0
          ${sidebarOpen ? 'w-[252px]' : 'w-[76px]'}`}
        >
          <div className="flex flex-col h-full py-5 px-3">
            {/* Collapse Toggle */}
            <div className={`mb-5 flex ${sidebarOpen ? 'justify-between items-center px-2' : 'justify-center'}`}>
              {sidebarOpen && (
                <span className="text-xs font-semibold text-slate-400">Academy Workspace</span>
              )}
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active =
                  pathname === item.href ||
                  (item.href !== '/teacher/dashboard' && pathname.startsWith(item.href))

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`group flex items-center gap-3 rounded-lg transition-colors px-3 py-2.5 relative whitespace-nowrap
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                      ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                    >
                      <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />

                      {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}

                      {!sidebarOpen && (
                        <div className="absolute left-14 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Profile Summary Footer */}
            {sidebarOpen && (
              <div className="mt-auto pt-4 border-t border-slate-100 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <UserCircle size={18} className="text-slate-500" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {user.email}
                    </span>
                    <span className="text-[11px] text-slate-500">Administrator</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 min-w-0">
          <div className="max-w-[1440px] mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
=======
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useUser, useClerk } from "@clerk/nextjs"
import {
  CheckCircle,
  BookOpen,
  LogOut,
  ClipboardCheck,
  Plus,
  LayoutDashboard,
  MessageSquare,
  Menu,
  ChevronLeft,
  ShieldCheck,
  UserCircle
} from 'lucide-react'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  
  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/login')
      return
    }
    // Role check for Super Admin
    if (user.publicMetadata?.role !== 'super_admin') {
      router.push('/student/dashboard')
      return
    }
  }, [user, isLoaded, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (!isLoaded || !user) return null

  const navItems = [
    { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/teacher/capstone/approvals', icon: ClipboardCheck, label: 'Capstone Approvals' },
    { href: '/teacher/courses/create', icon: Plus, label: 'Create Course' },
    { href: '/teacher/capstone/trello-approvals', icon: ClipboardCheck, label: 'Trello Access' },
    { href: '/teacher/certificates', icon: CheckCircle, label: 'Certificate Approvals' },
    { href: '/teacher/chat', icon: MessageSquare, label: 'Inbox' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* TOP COMMAND BAR */}
      <header className="sticky top-0 z-[60] h-[72px] bg-slate-900 text-white shadow-lg">
        <nav className="flex h-full items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Link href="/teacher/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight leading-none">ReadNRevise</span>
                <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Admin Panel</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-white leading-none">
                    {user?.fullName || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">System Overlord</span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-700 mx-2" />

            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </nav>
      </header>

      <div className="flex">
        {/* SIDEBAR (Command Center Style) */}
        <aside
          className={`sticky top-[72px] h-[calc(100vh-72px)] bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-40
          ${sidebarOpen ? 'w-[280px]' : 'w-[80px]'}`}
        >
          <div className="flex flex-col h-full py-6 px-4">
            
            {/* Collapse Toggle */}
            <div className={`mb-8 flex ${sidebarOpen ? 'justify-end' : 'justify-center'}`}>
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm"
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Menu Label */}
            {sidebarOpen && (
                <div className="px-4 mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Navigation</span>
                </div>
            )}

            {/* Nav Items */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || (item.href !== '/teacher/dashboard' && pathname.startsWith(item.href))

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`group flex items-center gap-3 rounded-xl transition-all duration-200 px-4 py-3.5 relative
                      ${active 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 font-bold' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                      ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'group-hover:text-blue-600'}`} />
                      
                      {sidebarOpen && (
                        <span className="text-[14px] tracking-tight">{item.label}</span>
                      )}

                      {!sidebarOpen && (
                        <div className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                            {item.label}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Profile Summary Footer */}
            {sidebarOpen && (
                <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                            <UserCircle size={20} className="text-slate-500" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-slate-700 truncate">{user.primaryEmailAddress?.emailAddress}</span>
                            <span className="text-[9px] text-green-600 font-bold uppercase tracking-tighter">Verified Admin</span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </main>
      </div>
    </div>
  )
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
}