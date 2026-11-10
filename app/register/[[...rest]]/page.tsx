'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SignUp, useUser } from "@clerk/nextjs"
import { useEffect } from 'react'
import { Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const { user, isLoaded } = useUser()

  // 🔥 AUTO CREATE USER IN SUPABASE (Logic preserved)
  useEffect(() => {
    if (!isLoaded || !user) return

    fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkId: user.id,
        name: user.fullName
      })
    })
  }, [user, isLoaded])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-white px-4 relative overflow-hidden">
      
      {/* Background Orbs for visual depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md flex flex-col items-center">
        {/* LOGO & HEADING SECTION */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-4 ring-1 ring-slate-200/50">
            <Image
              src="/assets/Readnrevise_logo.png"
              alt="ReadNRevise Logo"
              width={160}
              height={40}
              priority
              className="h-auto w-auto"
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

        {/* CLERK SIGN UP UI */}
        <div className="w-full shadow-2xl shadow-slate-200/60 rounded-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-500">
          <SignUp
            path="/register"
            routing="path"
            signInUrl="/login"
            fallbackRedirectUrl="/student/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none rounded-none w-full",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 transition-all text-sm normal-case shadow-md",
                footerActionLink: "text-blue-600 hover:text-blue-700 font-semibold",
                headerTitle: "hidden", // Custom header already exists above
                headerSubtitle: "hidden",
                dividerLine: "bg-slate-200",
                socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 font-medium",
                formFieldLabel: "text-slate-700 font-medium",
                formFieldInput: "rounded-xl border-slate-200 focus:ring-blue-500 transition-all",
                identityPreviewText: "text-slate-600",
                identityPreviewEditButton: "text-blue-600",
              }
            }}
          />
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in duration-1000">
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors underline-offset-4 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}
      <p className="absolute bottom-6 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
        Secure Onboarding · Powered by Clerk & Supabase
      </p>
    </div>
  )
}