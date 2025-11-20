'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Video, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'
import { initializeDemoData } from '@/components/demo-data'

export default function LandingPage() {
  useEffect(() => {
    initializeDemoData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ReadNRevise</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-pretty">Teach and Learn Online</span>
              <span className="block text-primary">The Right Way</span>
            </h1>
            <p className="text-xl text-foreground/70 max-w-xl">
              Create professional online courses, manage students, and build your learning community with our modern Learning Management System.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-lg h-12 px-8">
                  Start Teaching Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="text-lg h-12 px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="w-full aspect-square bg-primary/10 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <Video className="w-24 h-24 text-primary/40 mx-auto" />
                <p className="text-foreground/60">Interactive Learning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-foreground">Powerful Features</h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Everything you need to create, manage, and grow your online learning platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Easy Course Creation"
              description="Create courses with videos, descriptions, and content. Simple drag-and-drop interface."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Role-Based Access"
              description="Admin, Teachers, and Students with different permissions and dashboards."
            />
            <FeatureCard
              icon={<Video className="w-8 h-8" />}
              title="Video Support"
              description="Upload and stream videos directly from your local files. Full control over your content."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Student Progress"
              description="Track student enrollment, progress, and completion rates in real-time."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="Pricing Management"
              description="Set course prices, manage payments, and monetize your expertise."
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Professional Design"
              description="Modern, responsive interface that works on all devices and screen sizes."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-foreground">How It Works</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-bold text-foreground">Sign Up</h3>
            <p className="text-foreground/70">
              Create your account and choose your role (Teacher, Admin, or Student)
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-bold text-foreground">Create & Upload</h3>
            <p className="text-foreground/70">
              Teachers create courses with content, videos, and pricing
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-bold text-foreground">Learn & Grow</h3>
            <p className="text-foreground/70">
              Students enroll and start learning from expert instructors
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl opacity-90">
            Join thousands of educators and learners on EduLearn today
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ReadNRevise</span>
            </div>
            <p className="text-foreground/60">
              © 2025 ReadNRevise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border border-border hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="text-primary mb-4">{icon}</div>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/70">{description}</p>
      </CardContent>
    </Card>
  )
}
