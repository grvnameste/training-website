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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md rounded-xl border bg-white shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
            <BookOpen className="text-white w-7 h-7" />
          </div>

          <CardTitle className="text-2xl font-semibold">
            Create Account
          </CardTitle>

          <CardDescription className="text-slate-500">
            Start building real projects with ReadNRevise
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
                className="pl-9"
                placeholder="Full Name"
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                className="pl-9"
                placeholder="Email address"
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                className="pl-9"
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6">
              Create Account
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1" />
            <span className="text-xs text-slate-400">OR</span>
            <hr className="flex-1" />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => registerWithProvider('google')}
            >
              <FaGoogle className="h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => registerWithProvider('github')}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => registerWithProvider('linkedin')}
            >
              <Linkedin className="h-4 w-4" />
              Continue with LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
