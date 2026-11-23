'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Lock, User } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

export default function LoginPage() {
  const router = useRouter()
  const { refresh } = useUser()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || 'Unable to sign in')
        setLoading(false)
        return
      }

      await refresh()

      const params = new URLSearchParams(window.location.search)
      const redirectUrl = params.get('redirect_url')
      const safeRedirect =
        redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')
          ? redirectUrl
          : null

      router.replace(safeRedirect || '/dashboard')
      router.refresh()
    } catch {
      setError('Unable to sign in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md rounded-xl border bg-white shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center">
            <Image
              src="/assets/Readnrevise_logo.png"
              alt="ReadNRevise Logo"
              width={180}
              height={45}
              priority
              className="h-auto w-auto dark:brightness-0 dark:invert"
            />
          </div>

          <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>

          <CardDescription className="text-slate-500">
            Sign in to continue learning on ReadNRevise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                className="pl-9"
                placeholder="Username or email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                className="pl-9"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
