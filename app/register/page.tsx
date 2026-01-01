'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BookOpen,
  Github,
  Linkedin,
  User,
  Mail,
  Lock,
} from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import Link from 'next/link'

type OAuthProvider = 'google' | 'github' | 'linkedin'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // ✅ NORMALIZE EMAILS
    const normalizedEmail = email.trim().toLowerCase()
    const adminEmail =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase()

    const role =
      normalizedEmail === adminEmail ? 'teacher' : 'student'

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (error) {
      if (
        error.message.toLowerCase().includes('already') ||
        error.message.toLowerCase().includes('exists')
      ) {
        setError('Already have an account. Please login.')
      } else {
        setError(error.message)
      }
      return
    }

    router.replace('/login')
  }

  const registerWithProvider = async (provider: OAuthProvider) => {
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
            Create Account
          </CardTitle>
          <CardDescription>
            Start your learning journey with ReadNRevise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 rounded-xl"
                placeholder="Full Name"
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                className="pl-9 rounded-xl"
                placeholder="Email address"
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
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full rounded-full py-5">
              Create Account
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
              className="w-full rounded-full gap-2"
              onClick={() => registerWithProvider('google')}
            >
              <FaGoogle className="h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-full gap-2"
              onClick={() => registerWithProvider('github')}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-full gap-2"
              onClick={() => registerWithProvider('linkedin')}
            >
              <Linkedin className="h-4 w-4" />
              Continue with LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
