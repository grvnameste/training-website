//app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        if (!data.session) {
          router.replace('/login')
          return
        }

        const email = data.session.user.email

        if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          router.push('/teacher/dashboard')
        } else {
          router.push('/student/dashboard')
        }
      }
    )
  }, [router])

  return <p>Logging you in...</p>
}
