'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, LogOut } from 'lucide-react'
import { getCurrentUser, logout } from '@/lib/auth'

// If you run into "Element type is invalid" errors, move EditProfile to /components and import from there.
// For now importing from app/student/profile as you had it.
import EditProfile from '@/app/student/profile/EditProfile'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showEdit, setShowEdit] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          
          {/* Logo */}
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ReadNRevise</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Profile avatar (clickable) - shows avatar image or initial */}
            <button
              onClick={() => setShowEdit(true)}
              className="w-10 h-10 rounded-full overflow-hidden border border-border flex items-center justify-center bg-gray-50"
              title="Edit profile"
              aria-label="Edit profile"
            >
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name || user.email || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-foreground/60">
                  {(user?.name || user?.email || 'S').charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </header>

      {/* EditProfile modal rendered at layout level so it's available globally */}
      {showEdit && user && (
        <EditProfile
          initial={user}
          onClose={() => setShowEdit(false)}
          onSave={(updatedUser) => {
            // EditProfile should update localStorage; keep layout state in sync
            setUser(updatedUser)
            setShowEdit(false)
          }}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
