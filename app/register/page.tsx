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
import { BookOpen, Github, Linkedin } from 'lucide-react'
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

    // ✅ NORMALIZE EMAILS (IMPORTANT)
    const normalizedEmail = email.trim().toLowerCase()
    const adminEmail =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase()

    // 🔍 DEBUG (temporary – remove later)
    console.log('INPUT EMAIL:', normalizedEmail)
    console.log('ADMIN EMAIL ENV:', adminEmail)
    console.log(
      'EMAIL MATCH:',
      normalizedEmail === adminEmail
    )

    const role =
      normalizedEmail === adminEmail ? 'teacher' : 'student'

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
          role, // ✅ FINAL SOURCE OF TRUTH
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
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Full Name"
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button className="w-full">Create Account</Button>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <hr className="flex-1" />
          </div>

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
