//app/login/page.tsx
'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect  } from 'react'
import Image from 'next/image'
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

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
  
      if (session) {
        const role = session.user.user_metadata?.role
        router.replace(
          role === 'super_admin'
            ? '/teacher/dashboard'
            : '/student/dashboard'
        )
        router.refresh()
      }
    }
  
    checkSession()
  }, [router])
  

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

    // ✅ LOGIN SUCCESS → ROLE BASED REDIRECT
const { data: userData } = await supabase.auth.getUser()
const role = userData?.user?.user_metadata?.role

router.replace(
  role === 'super_admin'
    ? '/teacher/dashboard'
    : '/student/dashboard'
)

router.refresh()
    

 
    
  }

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md rounded-xl border bg-white shadow-lg">
        <CardHeader className="text-center space-y-3">
        <div className="mx-auto flex items-center justify-center">
        <Image
  src="/assets/Readnrevise_logo.png"
  alt="ReadNRevise Logo"
  width={180}
  height={45}
  priority
/>

</div>


          <CardTitle className="text-2xl font-semibold">
            Welcome Back
          </CardTitle>

          <CardDescription className="text-slate-500">
            Sign in to continue learning on ReadNRevise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center">
              {error}
              {error === "Don’t have an account. Please register." && (
                <div className="mt-2">
                  <Button
                    variant="link"
                    className="p-0 text-blue-600"
                    onClick={() => router.push('/register')}
                  >
                    Go to Register
                  </Button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                className="pl-9"
                placeholder="Email address"
                value={email}
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
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
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
              onClick={() => loginWithProvider('google')}
            >
              <FaGoogle className="h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => loginWithProvider('github')}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => loginWithProvider('linkedin')}
            >
              <Linkedin className="h-4 w-4" />
              Continue with LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
