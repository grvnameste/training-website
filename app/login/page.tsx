'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BookOpen } from 'lucide-react'
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const redirectUser = (user: any) => {
    localStorage.setItem('lms_current_user', JSON.stringify(user))
    router.push(
      user.role === 'student'
        ? '/student/dashboard'
        : '/teacher/dashboard'
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    const users = JSON.parse(localStorage.getItem('lms_users') || '[]')
    const user = users.find(
      (u: any) =>
        u.email === formData.email && u.password === formData.password
    )

    if (!user) {
      setError('Invalid email or password')
      return
    }

    redirectUser(user)
  }

  /** Demo Social Login */
  const socialLogin = (provider: 'google' | 'github' | 'linkedin') => {
    const user = {
      name: `${provider} user`,
      email: `${provider}@demo.com`,
      role: 'student',
      provider
    }
    redirectUser(user)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">ReadNRevise</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => socialLogin('google')}>
                <FaGoogle className="mr-2" /> Google
              </Button>
              <Button variant="outline" onClick={() => socialLogin('github')}>
                <FaGithub className="mr-2" /> GitHub
              </Button>
              <Button variant="outline" onClick={() => socialLogin('linkedin')}>
                <FaLinkedin className="mr-2" /> LinkedIn
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              or login with email
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              <Button className="w-full h-11 text-lg">Sign In</Button>

              <p className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary font-medium">
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
