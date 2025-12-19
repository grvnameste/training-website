'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BookOpen, Mail, Lock, Github, Linkedin } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'

type OAuthProvider = 'google' | 'github' | 'linkedin'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= EMAIL LOGIN ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      setError('Login failed. Try again.')
      setLoading(false)
      return
    }

    if (data.session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.replace('/teacher/dashboard')
    } else {
      router.replace('/student/dashboard')
    }
  }

  /* ================= SOCIAL LOGIN ================= */
  const loginWithProvider = async (provider: OAuthProvider) => {
    const supabaseProvider =
      provider === 'linkedin' ? 'linkedin_oidc' : provider

    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider as any,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue learning on ReadNRevise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                type="email"
                placeholder="Email"
                className="pl-10"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <hr className="flex-1" />
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => loginWithProvider('google')}>
              <FaGoogle /> Continue with Google
            </Button>

            <Button variant="outline" className="w-full" onClick={() => loginWithProvider('github')}>
              <Github /> Continue with GitHub
            </Button>

            <Button variant="outline" className="w-full" onClick={() => loginWithProvider('linkedin')}>
              <Linkedin /> Continue with LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm">
            Don’t have an account?{' '}
            <Link href="/register" className="text-teal-600 font-medium">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
