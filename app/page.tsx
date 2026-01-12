'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BookOpen,
  Users,
  TrendingUp,
  ArrowRight,
  Play,
} from 'lucide-react'
import type { ReactNode } from 'react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b12] text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 backdrop-blur bg-black/40 border-b border-white/5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg">
              <BookOpen className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-wide">
              ReadNRevise
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-teal-400 text-black hover:bg-teal-300 px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* glow */}
          <div className="absolute -top-40 -left-40 h-96 w-96 bg-teal-400/20 blur-3xl rounded-full" />
          <div className="absolute top-20 -right-40 h-96 w-96 bg-cyan-500/20 blur-3xl rounded-full" />

          <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-sm text-teal-300 border border-white/10">
              ● Now in Beta — Join 500+ developers
            </span>

            <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Learn to Build Software
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mt-2">
                The Way Professionals Do
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Master the complete Software Development Life Cycle through
              hands-on, team-based projects — just like in real companies.
            </p>

            <div className="mt-12 flex justify-center gap-4 flex-wrap">
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-full bg-teal-400 text-black hover:bg-teal-300 px-10"
                >
                  Start Building Real Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              {/* ✅ UPDATED BUTTON */}
              <Button
                size="lg"
                className="
                  rounded-full
                  border border-white/20
                  bg-white/5
                  text-white
                  backdrop-blur
                  hover:bg-white/10
                  hover:shadow-lg
                  transition
                "
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Button>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-7 w-7" />}
              title="Structured SDLC Projects"
              description="Follow industry-standard software development lifecycle."
            />
            <FeatureCard
              icon={<Users className="h-7 w-7" />}
              title="Team-Based Learning"
              description="Work like real development teams with roles & reviews."
            />
            <FeatureCard
              icon={<TrendingUp className="h-7 w-7" />}
              title="Track Real Progress"
              description="Move step-by-step from requirements to deployment."
            />
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-28 text-center bg-gradient-to-r from-teal-400/10 to-cyan-400/10 border-t border-white/5">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Build Your First Professional Project
          </h2>
          <p className="mt-4 text-white/60">
            Stop watching tutorials. Start building real software.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="mt-10 rounded-full bg-teal-400 text-black hover:bg-teal-300 px-12"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/50">
        © 2025 ReadNRevise. All rights reserved.
      </footer>
    </div>
  )
}

/* ---------------- SUB COMPONENT ---------------- */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 inline-flex rounded-xl bg-teal-400/10 p-3 text-teal-300">
          {icon}
        </div>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-white/60">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
