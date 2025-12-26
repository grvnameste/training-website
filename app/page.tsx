//app/page.tsx
'use client'

import { useEffect, type ReactNode } from 'react'
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
  CheckCircle2,
} from 'lucide-react'
import { initializeDemoData } from '@/components/demo-data'

export default function LandingPage() {
  useEffect(() => {
    initializeDemoData()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              ReadNRevise
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="h-9 px-4 text-sm sm:h-10 sm:px-5">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="h-9 px-4 text-sm sm:h-10 sm:px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/70 shadow-sm sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Modern Learning Management System
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-pretty">Teach and Learn Online</span>
                <span className="block text-primary">The Right Way</span>
              </h1>

              <p className="max-w-xl text-base text-foreground/70 sm:text-lg">
                Access professional online courses, track your progress, and revise
                effectively with our modern Learning Management System.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                <Link href="/register">
                  <Button className="flex h-11 items-center px-7 text-base sm:h-12 sm:text-lg">
                    Start Learning Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="h-11 px-7 text-base sm:h-12 sm:text-lg"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Coursera-like small stats row */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-xs text-foreground/60 sm:text-sm">
                <div>
                  <div className="font-semibold text-foreground">Curated Courses</div>
                  <p className="mt-1 leading-snug">
                    All courses are created and managed by the ReadNRevise admin.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-foreground">For Students</div>
                  <p className="mt-1 leading-snug">
                    Simple sign-up and learn flow for every visitor.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Focused Learning</div>
                  <p className="mt-1 leading-snug">
                    Structured content designed to help you revise better.
                  </p>
                </div>
              </div>
            </div>

            {/* Right – simple interactive learning card */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-primary/10 blur-3xl" />
              <div className="relative mx-auto w-full max-w-md rounded-3xl border border-border bg-background/90 p-8 sm:p-10 shadow-xl shadow-primary/10 flex flex-col items-center justify-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Video className="h-10 w-10 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Interactive Learning
                </p>
                <p className="max-w-xs text-center text-sm text-foreground/70">
                  Learn with videos, assignments, and real-time progress tracking in
                  a clean, distraction-free interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b border-border bg-secondary/10">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-10 max-w-3xl text-center space-y-3 md:mb-14">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Powerful Features
              </h2>
              <p className="text-base text-foreground/70 sm:text-lg">
                Everything you need to learn, revise, and track your progress
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Structured Courses"
                description="Well-organized lessons created and maintained by the ReadNRevise admin."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Admin-Managed Content"
                description="Only the ReadNRevise owner can upload and manage courses. Students just sign up and start learning."
              />
              <FeatureCard
                icon={<Video className="h-8 w-8" />}
                title="Video Support"
                description="Watch course videos directly on the platform with smooth playback."
              />
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8" />}
                title="Student Progress"
                description="Track your enrollment, progress, and completion status in real-time."
              />
              <FeatureCard
                icon={<CheckCircle2 className="h-8 w-8" />}
                title="Pricing Management"
                description="Clear course access and pricing controlled centrally by the admin."
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Professional Design"
                description="Modern, responsive interface that works on all devices and screen sizes."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-10 max-w-3xl text-center space-y-3 md:mb-14">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works
              </h2>
              <p className="text-base text-foreground/70 sm:text-lg">
                Get started in three simple steps
              </p>
            </div>

            {/* Coursera-like steps */}
            <div className="grid gap-8 md:grid-cols-3 md:gap-6">
              <HowItWorksStep
                step="1"
                title="Sign Up as a Student"
                description="Create your ReadNRevise account using your email and basic details."
              />
              <HowItWorksStep
                step="2"
                title="Browse Available Courses"
                description="Explore courses curated and uploaded by the ReadNRevise admin."
              />
              <HowItWorksStep
                step="3"
                title="Learn & Revise"
                description="Start watching lessons, track your progress, and revise anytime."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center text-primary-foreground sm:px-6 md:py-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="mt-3 text-base opacity-90 sm:mt-4 sm:text-lg">
              Join students learning and revising with ReadNRevise today
            </p>
            <div className="mt-6">
              <Link href="/register">
                <Button
                  size="lg"
                  className="inline-flex h-11 items-center rounded-full bg-primary-foreground px-8 text-sm font-semibold text-primary hover:bg-primary-foreground/90 sm:h-12 sm:px-10 sm:text-base"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-foreground/60 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">ReadNRevise</span>
          </div>
          <p>© 2025 ReadNRevise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

/* --- Sub components --- */

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="h-full border border-border/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
          {icon}
        </div>
        <CardTitle className="text-base font-semibold sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-sm text-foreground/70">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}

interface HowItWorksStepProps {
  step: string
  title: string
  description: string
}

function HowItWorksStep({ step, title, description }: HowItWorksStepProps) {
  return (
    <div className="relative flex flex-col items-center rounded-2xl border border-border bg-background px-6 py-8 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-center text-sm text-foreground/70">{description}</p>
    </div>
  )
}
