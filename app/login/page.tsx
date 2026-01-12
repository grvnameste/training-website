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

    /* STORE LOGIN ACTIVITY */
    await supabase.from('student_activity').insert({
      student_id: session.user.id,
      type: 'LOGIN',
    })

    const role = session.user.user_metadata?.role

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
    <div className="relative min-h-screen flex items-center justify-center bg-[#070b12] px-4 overflow-hidden text-white">
      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="absolute top-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

      <Card className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <BookOpen className="text-black w-7 h-7" />
          </div>

          <CardTitle className="text-2xl font-bold">
            Welcome Back
          </CardTitle>

          <CardDescription className="text-white/60">
            Sign in to continue learning on ReadNRevise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
              {error}
              {error === "Don’t have an account. Please register." && (
                <div className="mt-2">
                  <Button
                    variant="link"
                    className="p-0 text-teal-300"
                    onClick={() => router.push('/register')}
                  >
                    Go to Register
                  </Button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="email"
                className="pl-9 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-teal-400"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="password"
                className="pl-9 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-teal-400"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              className="w-full rounded-full py-6 bg-teal-400 text-black hover:bg-teal-300 font-semibold"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* OR */}
          <div className="flex items-center gap-3">
            <hr className="flex-1 border-white/10" />
            <span className="text-xs text-white/40">OR</span>
            <hr className="flex-1 border-white/10" />
          </div>

          {/* OAUTH */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full rounded-full gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => loginWithProvider('google')}
            >
              <FaGoogle className="h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-full gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => loginWithProvider('github')}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-full gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => loginWithProvider('linkedin')}
            >
              <Linkedin className="h-4 w-4" />
              Continue with LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm text-white/50">
            Don’t have an account?{' '}
            <Link
              href="/register"
              className="text-teal-300 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
