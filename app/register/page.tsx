//app/register/page.tsx
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
import { BookOpen, User, Mail, Lock, Github, Linkedin } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import Link from 'next/link'

type OAuthProvider = 'google' | 'github' | 'linkedin'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  /* ================= EMAIL REGISTER ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      // ✅ Existing account handling
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

  /* ================= SOCIAL REGISTER ================= */
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
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Start your learning journey with ReadNRevise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg text-center">
              {error}
              {error === 'Already have an account. Please login.' && (
                <div className="mt-2">
                  <Button
                    variant="link"
                    className="p-0 text-teal-600"
                    onClick={() => router.push('/login')}
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                placeholder="Full Name"
                className="pl-10"
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                type="email"
                placeholder="Email"
                className="pl-10"
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
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full">Create Account</Button>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <hr className="flex-1" />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => registerWithProvider('google')}
            >
              <FaGoogle /> Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => registerWithProvider('github')}
            >
              <Github /> Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => registerWithProvider('linkedin')}
            >
              <Linkedin /> Continue with LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 font-medium">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
