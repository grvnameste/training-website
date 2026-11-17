'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PublicUser } from '@/lib/auth/types'

interface AuthContextValue {
  user: PublicUser | null
  isLoaded: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      setUser(data?.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      window.location.assign('/login')
    }
  }, [])

  const value = useMemo(
    () => ({ user, isLoaded, refresh, signOut }),
    [user, isLoaded, refresh, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
