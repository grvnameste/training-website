'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Lock, Mail, Sparkles, User } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

export default function RegisterPage() {
  const router = useRouter()
  const { refresh } = useUser()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || 'Could not create your account')
        setLoading(false)
        return
      }

      await refresh()
      router.replace('/student/dashboard')
      router.refresh()
    } catch {
      setError('Could not create your account. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-white px-4 relative overflow-hidden dark:from-slate-800 dark:via-[#0b1220] dark:to-[#070d19]">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-4 ring-1 ring-slate-200/50">
            <Image
              src="/assets/Readnrevise_logo.png"
              alt="ReadNRevise Logo"
              width={160}
              height={40}
              priority
              className="h-auto w-auto dark:brightness-0 dark:invert"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={18} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          </div>
          <p className="text-slate-500 mt-2 font-medium">
            Start building real projects with ReadNRevise
          </p>
        </div>

        <div className="w-full bg-white shadow-2xl shadow-slate-200/60 rounded-2xl border border-white p-6 animate-in zoom-in-95 duration-500">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                className="pl-9"
                placeholder="Full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                className="pl-9"
                placeholder="Username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                className="pl-9"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                className="pl-9"
                placeholder="Password (min. 8 characters)"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                className="pl-9"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in duration-1000">
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors underline-offset-4 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <p className="absolute bottom-6 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
        Secure Onboarding · ReadNRevise
      </p>
    </div>
  )
}
