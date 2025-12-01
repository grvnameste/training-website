'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BookOpen } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    // Check credentials
    const users = JSON.parse(localStorage.getItem('lms_users') || '[]')
    const user = users.find(
      (u: any) => u.email === formData.email && u.password === formData.password
    )

    if (!user) {
      setError('Invalid email or password')
      return
    }

    localStorage.setItem('lms_current_user', JSON.stringify(user))

    // Redirect based on role
    if (user.role === 'student') {
      router.push('/student/dashboard')
    } else {
      router.push('/teacher/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ReadNRevise</h1>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-input text-foreground"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-input text-foreground"
                />
              </div>

              {/* Submit Button */}
              <Button className="w-full bg-primary hover:bg-primary/90 text-lg h-11">
                Sign In
              </Button>

              {/* Register Link */}
              <p className="text-center text-foreground/70">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-secondary/30 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground/70 mb-3 font-medium">Demo Credentials:</p>
            <div className="space-y-2 text-sm">
              <p className="text-foreground/60">
                <span className="font-medium">Teacher:</span> teacher@demo.com / pass123
              </p>
              <p className="text-foreground/60">
                <span className="font-medium">Admin:</span> admin@demo.com / pass123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
