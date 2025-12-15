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

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })
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

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    const users = JSON.parse(localStorage.getItem('lms_users') || '[]')
    if (users.find((u: any) => u.email === formData.email)) {
      setError('Email already registered')
      return
    }

    users.push(formData)
    localStorage.setItem('lms_users', JSON.stringify(users))
    redirectUser(formData)
  }

  /** ✅ FIXED: Social Register also saves user */
  const socialRegister = (provider: 'google' | 'github' | 'linkedin') => {
    const users = JSON.parse(localStorage.getItem('lms_users') || '[]')

    const email = `${provider}@demo.com`
    let user = users.find((u: any) => u.email === email)

    if (!user) {
      user = {
        name: `${provider} user`,
        email,
        role: 'student',
        provider
      }
      users.push(user)
      localStorage.setItem('lms_users', JSON.stringify(users))
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
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Register */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => socialRegister('google')}>
                <FaGoogle className="mr-2" /> Google
              </Button>
              <Button variant="outline" onClick={() => socialRegister('github')}>
                <FaGithub className="mr-2" /> GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => socialRegister('linkedin')}
              >
                <FaLinkedin className="mr-2" /> LinkedIn
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              or register with email
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

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

              {/* Role */}
              <div className="grid grid-cols-3 gap-2">
                {['admin', 'teacher', 'student'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`py-2 rounded border text-sm font-medium ${
                      formData.role === role
                        ? 'bg-primary text-white'
                        : 'bg-background'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <Button className="w-full h-11 text-lg">
                Create Account
              </Button>

              <p className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
