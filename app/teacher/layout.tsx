'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Users,
  Layers,
  CheckCircle,
  TrendingUp,
  BookOpen,
  LogOut,
  ClipboardCheck,
  Plus,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react'

import supabase from '@/lib/supabase/client'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        router.push('/login')
        return
      }

      const role = data.user.user_metadata?.role
      if (role !== 'teacher' && role !== 'admin') {
        router.push('/login')
        return
      }

      setUser({
        name: data.user.user_metadata?.name || data.user.email,
        role,
      })

      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-background">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <nav className="flex items-center justify-between px-6 py-4">
          <Link href="/teacher/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ReadNRevise</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </header>


      {/* ================= BODY ================= */}
      <div className="flex">
        {/* ===== SIDEBAR ===== */}
        <aside className="w-[240px] border-r bg-background min-h-[calc(100vh-72px)] px-4 py-6">
          <nav className="flex flex-col gap-2">
            {/* Dashboard */}
            <Link href="/teacher/dashboard">
              <Button
                variant={
                  pathname === '/teacher/dashboard'
                    ? 'secondary'
                    : 'ghost'
                }
                className="w-full justify-start gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>

            {/* Capstone Approvals */}
            <Link href="/teacher/capstone/approvals">
              <Button
                variant={
                  pathname.startsWith('/teacher/capstone')
                    ? 'secondary'
                    : 'ghost'
                }
                className="w-full justify-start gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Capstone Approvals
              </Button>
            </Link>

            {/* Create Course */}
            <Link href="/teacher/courses/create">
              <Button
                variant={
                  pathname.startsWith('/teacher/courses')
                    ? 'secondary'
                    : 'ghost'
                }
                className="w-full justify-start gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
            </Link>

            {/* Trello Access */}
            <Link href="/teacher/capstone/trello-approvals">
              <Button
                variant={
                  pathname.includes('trello')
                    ? 'secondary'
                    : 'ghost'
                }
                className="w-full justify-start gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Trello Access
              </Button>
            </Link>

            {/* Certificate Approvals */}
<Link href="/teacher/certificates">
  <Button
    variant={
      pathname.startsWith('/teacher/certificates')
        ? 'secondary'
        : 'ghost'
    }
    className="w-full justify-start gap-2"
  >
    <CheckCircle className="w-4 h-4" />
    Certificate Approvals
  </Button>
</Link>
            
            {/* Messages */}
            <Link href="/teacher/chat">
              <Button
                variant={
                  pathname === '/teacher/chat'
                    ? 'secondary'
                    : 'ghost'
                }
                className="w-full justify-start gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </Button>
            </Link>

          </nav>
        </aside>

        {/* ===== CONTENT ===== */}
        <main className="flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
