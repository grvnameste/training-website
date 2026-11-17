'use client'

import { useAuthContext } from '@/components/providers/auth-provider'

export function useUser() {
  const { user, isLoaded, refresh } = useAuthContext()
  return { user, isLoaded, refresh }
}

export function useAuth() {
  const { signOut, refresh } = useAuthContext()
  return { signOut, refresh }
}
