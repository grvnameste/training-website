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
<div className="min-h-screen flex flex-col">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">
              ReadNRevise
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <main className="flex-1">
      <section className="bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-sm text-blue-700">
              Now in Beta — Join 500+ developers
            </span>

            <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold">
              Learn to Build Software
              <span className="block text-blue-600 mt-2">
                The Way Professionals Do
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Master the complete Software Development Life Cycle through
              hands-on, team-based projects — just like in real companies.
            </p>

            <div className="mt-12 flex justify-center gap-4 flex-wrap">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10"
                >
                  Start Building Real Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="px-8"
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
              icon={<BookOpen className="h-7 w-7 text-blue-600" />}
              title="Structured SDLC Projects"
              description="Follow industry-standard software development lifecycle."
            />
            <FeatureCard
              icon={<Users className="h-7 w-7 text-blue-600" />}
              title="Team-Based Learning"
              description="Work like real development teams with roles & reviews."
            />
            <FeatureCard
              icon={<TrendingUp className="h-7 w-7 text-blue-600" />}
              title="Track Real Progress"
              description="Move step-by-step from requirements to deployment."
            />
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-24 bg-blue-600 text-white text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Build Your First Professional Project
          </h2>
          <p className="mt-4 text-blue-100">
            Stop watching tutorials. Start building real software.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="mt-10 bg-white text-blue-600 hover:bg-blue-50 px-12"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t py-8 text-center text-sm text-slate-500">
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
    <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 inline-flex rounded-lg bg-blue-50 p-3">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
