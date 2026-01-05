'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      const user = session.user
      let role = user.user_metadata?.role

      /* ===============================
         FIX: SET ROLE FOR OAUTH USERS
      =============================== */
      if (!role) {
        const adminEmail =
          process.env.NEXT_PUBLIC_ADMIN_EMAIL
            ?.trim()
            .toLowerCase()

        role =
          user.email?.toLowerCase() === adminEmail
            ? 'teacher'
            : 'student'

        // 🔥 IMPORTANT: persist role
        await supabase.auth.updateUser({
          data: { role },
        })
      }

      /* ===============================
         REDIRECT BY ROLE
      =============================== */
      if (role === 'teacher') {
        router.replace('/teacher/dashboard')
      } else {
        router.replace('/student/dashboard')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center">
      Logging you in...
    </div>
  )
}
