//app/login/page.stx
'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      // ✅ Not registered / wrong credentials handling
      if (
        error.message.toLowerCase().includes('invalid') ||
        error.message.toLowerCase().includes('not found') ||
        error.message.toLowerCase().includes('credentials')
      ) {
        setError("Don’t have an account. Please register.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session) {
      setError('Login failed. Try again.')
      setLoading(false)
      return
    }

    /* 🔥 STORE LOGIN ACTIVITY */
    const { error: activityError } = await supabase
      .from('student_activity')
      .insert({
        student_id: session.user.id,
        type: 'LOGIN',
      })

    if (activityError) {
      console.error('Login activity insert failed:', activityError.message)
    }

    // ✅ ONLY TRUST METADATA
    const role = session.user.user_metadata?.role

    console.log('LOGIN ROLE:', role) // debug

    if (role === 'teacher') {
      router.replace('/teacher/dashboard')
    } else {
      router.replace('/student/dashboard')
    }
  }

  /* ================= OAUTH LOGIN ================= */
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
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0f2a] via-[#120c2f] to-background px-4 overflow-hidden">
      {/* glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />

      <Card className="relative w-full max-w-md rounded-3xl border bg-background/85 backdrop-blur shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <BookOpen className="text-primary-foreground w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to continue learning on ReadNRevise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
              {error}
              {error === "Don’t have an account. Please register." && (
                <div className="mt-2">
                  <Button
                    variant="link"
                    className="p-0 text-teal-600"
                    onClick={() => router.push('/register')}
                  >
                    Go to Register
                  </Button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                className="pl-9 rounded-xl"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                className="pl-9 rounded-xl"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              className="w-full rounded-full py-5"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-muted" />
            <span className="text-xs text-muted-foreground">OR</span>
            <hr className="flex-1 border-muted" />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => loginWithProvider('google')}
            >
              <FaGoogle /> Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => loginWithProvider('github')}
            >
              <Github /> Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => loginWithProvider('linkedin')}
            >
              <Linkedin /> Continue with LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don’t have an account?{' '}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
