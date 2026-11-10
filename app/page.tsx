//app/page.tsx
'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookOpen, Users, TrendingUp, ArrowRight, Code2, Globe, Rocket, Shield, Terminal, Cpu, Database, Layout } from 'lucide-react'
import type { ReactNode } from 'react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-28 pb-24 overflow-hidden">
          {/* Advanced Background Pattern */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#eff6ff_0,white_100%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10" />
          
          <div className="mx-auto max-w-7xl px-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-8 animate-fade-in shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              Now in Beta — The Future of Tech Education
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.05] mb-8">
              Build Software <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Like a Senior Engineer
              </span>
            </h1>

            {/* Subtext */}
            <p className="mx-auto max-w-2xl text-xl md:text-2xl text-slate-600 leading-relaxed mb-12">
              Master the full SDLC through high-performance squad collaboration. 
              <span className="text-slate-900 font-medium"> No tutorials, just production-grade code.</span>
            </p>

            {/* Actions */}
            <div className="flex justify-center gap-5 flex-wrap mb-20">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-16 text-lg rounded-2xl shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95">
                  Start Your First Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="px-10 h-16 text-lg rounded-2xl border-slate-200 hover:bg-slate-50 transition-all bg-white/50 backdrop-blur-sm">
Explore Courses              
  </Button>
              </Link>
            </div>

            {/* Floating Tech Stack Icons (Mockup ki jagah ye cool lagega) */}
            <div className="flex justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                <TechIcon icon={<Code2 />} label="Next.js" />
                <TechIcon icon={<Database />} label="PostgreSQL" />
                <TechIcon icon={<Terminal />} label="Docker" />
                <TechIcon icon={<Layout />} label="Tailwind" />
                <TechIcon icon={<Cpu />} label="AWS" />
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION - Bento Style ================= */}
        <section className="py-32 bg-slate-50/50 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-2xl text-left">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Built for Future Tech Leads</h2>
                    <p className="text-slate-600 text-lg">We don't just teach syntax. We teach systems, architecture, and team dynamics.</p>
                </div>
                <div className="hidden md:block">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-500 shadow-sm">
                        Total Modules: <span className="text-blue-600">42+</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<BookOpen size={28} />}
                title="Structured SDLC"
                description="Follow the exact roadmap used by FAANG: Planning, Dev, QA, and automated CI/CD Deployment."
              />
              <FeatureCard
                icon={<Users size={28} />}
                title="Agile Squads"
                description="Work in 4-person squads with dedicated leads. Practice PR reviews, standups, and sprint planning."
              />
              <FeatureCard
                icon={<TrendingUp size={28} />}
                title="Proof of Competence"
                description="Forget certificates. Your dashboard shows live metrics, commit velocity, and peer feedback."
              />
            </div>
          </div>
        </section>

        {/* ================= STATS SECTION ================= */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            <Stat label="Active Builders" value="500+" />
            <Stat label="Projects Shipped" value="1.2k" />
            <Stat label="Code Reviews" value="10k+" />
            <Stat label="Success Rate" value="98%" />
          </div>
        </section>

       {/* ================= UPDATED BRANDING & TRUST SECTION ================= */}
        
        {/* Branding Badge - High Visibility */}
        <div className="flex justify-center mt-12 mb-[-24px] relative z-20">
          <div className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-all duration-300 cursor-default">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-tight">
              Internal Product Ecosystem <span className="mx-1.5 text-slate-200">|</span> 
              <span className="text-slate-900 group-hover:text-blue-600 transition-colors">ReadNRevise</span>
            </p>
          </div>
        </div>

        {/* Trust Section - Professional Grid */}
        <section className="py-32 bg-[#fcfcfd] border-t border-slate-100 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
                Why Developers <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Choose Us</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Built as a real production-grade platform focused on practical learning and real-world development protocols.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group p-10 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                  <Rocket className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-slate-900">Real Projects</h3>
                <p className="text-slate-500 leading-relaxed">
                  Work on real-world applications with actual user flows, not just dummy todo-list tutorials.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group p-10 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500">
                  <Shield className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-slate-900">Industry Workflow</h3>
                <p className="text-slate-500 leading-relaxed">
                  Follow high-standard Git workflows, automated PR reviews, and production-grade pipelines.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group p-10 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
                  <TrendingUp className="w-6 h-6 text-emerald-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-slate-900">Career Ready</h3>
                <p className="text-slate-500 leading-relaxed">
                  Master the soft skills and technical depth that hiring managers actually look for in Senior roles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA - High Impact ================= */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden shadow-3xl">
            {/* Abstract Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                Stop Watching. <br /> Start Shipping.
              </h2>
              <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Join the only platform where your learning is measured by the quality of your production code. 
                <span className="text-blue-400"> Limited beta spots available.</span>
              </p>
              <div className="mt-12">
                <Link href="/register">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-16 text-xl rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
                    Claim Your Beta Access
                    <Rocket className="ml-2 h-6 w-6" />
                    </Button>
                </Link>
                <p className="mt-6 text-slate-500 text-sm">No credit card required • Free during beta</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

/* ---------------- SUB COMPONENTS ---------------- */

function TechIcon({ icon, label }: { icon: ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 group cursor-default">
            <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <Card className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
      <CardHeader className="relative z-10 pb-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 mb-4">{title}</CardTitle>
        <CardDescription className="text-slate-600 text-lg leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      {/* Decorative Ghost Icon */}
      <div className="absolute -bottom-4 -right-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none group-hover:scale-[3] rotate-12">
        {icon}
      </div>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center group">
      <div className="text-5xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</div>
      <div className="h-1 w-0 bg-blue-600 mx-auto mt-4 group-hover:w-12 transition-all duration-500" />
    </div>
  )
}