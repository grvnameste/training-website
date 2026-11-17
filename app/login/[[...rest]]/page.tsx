//app/login/[[...rest]]/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import Image from 'next/image'
import Link from 'next/link'
import { useClerk } from "@clerk/nextjs"
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  const { signOut } = useClerk()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">

      <div className="text-center mb-6">
        <Image
          src="/assets/Readnrevise_logo.png"
          alt="ReadNRevise Logo"
          width={180}
          height={45}
          priority
        />
        <h1 className="text-2xl font-semibold mt-3">Welcome Back</h1>
        <p className="text-slate-500 text-sm">
          Sign in to continue learning
        </p>
      </div>

      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/register"
        forceRedirectUrl="/dashboard"      />

      <button
        onClick={() => signOut()}
        className="mt-3 text-sm text-red-500 underline"
      >
        Force Logout (Debug)
      </button>

      <p className="text-center text-sm text-slate-500 mt-4">
        Don’t have an account?{' '}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">
          Register
        </Link>
      </p>

    </div>
  )
}