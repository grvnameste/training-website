//app/page.tsx
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
  Video,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import type { ReactNode } from 'react'

export default function LandingPage() {
  return (
    <div className="min-h-screen text-foreground flex flex-col bg-gradient-to-b from-[#0b0f2a] via-[#120c2f] to-background">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 backdrop-blur bg-background/70 border-b">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-wide">
              ReadNRevise
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* glow blobs */}
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              Teach and Learn Online
              <span className="block text-primary mt-2">
                The Right Way
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Access structured courses, track progress, and revise effectively
              with ReadNRevise LMS.
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* floating card */}
            <div className="mt-16 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-background/90 backdrop-blur border shadow-2xl p-8">
                <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-center font-semibold text-lg">
                  Interactive Learning
                </p>
                <p className="text-center text-sm text-foreground/70 mt-2">
                  Video lessons, structured curriculum, and focused learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-6xl px-4 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-7 w-7" />}
              title="Structured Courses"
              description="Carefully organized lessons and sections."
            />
            <FeatureCard
              icon={<Users className="h-7 w-7" />}
              title="Admin Managed"
              description="Courses managed centrally for quality learning."
            />
            <FeatureCard
              icon={<TrendingUp className="h-7 w-7" />}
              title="Track Progress"
              description="Monitor learning and completion easily."
            />
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-24 text-center bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Start Learning with ReadNRevise
          </h2>
          <p className="mt-4 opacity-90">
            Join today and experience focused learning.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="mt-8 rounded-full bg-primary-foreground text-primary px-10"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t py-8 text-center text-sm text-foreground/60 bg-background">
        © 2025 ReadNRevise. All rights reserved.
      </footer>
    </div>
  )
}

/* ---------------- SUB COMPONENTS ---------------- */

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
    <Card className="group rounded-2xl border bg-background/80 backdrop-blur transition hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
