'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session) {
        router.replace('/login')
        return
      }

      // ✅ ONLY SOURCE OF TRUTH
      const role = session.user.user_metadata?.role

      console.log('CALLBACK ROLE:', role) // debug

      if (role === 'teacher') {
        router.replace('/teacher/dashboard')
      } else {
        router.replace('/student/dashboard')
      }
    }

    handleAuth()
  }, [router])

  return <p>Logging you in...</p>
}
