'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, ShieldCheck, Workflow, CheckCircle2, Rocket, Target, Zap } from 'lucide-react'

export default function AboutPageContent() {
  return (
    <div className="min-h-screen bg-white">

      {/* HERO SECTION - Minimal & Bold */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={14} className="fill-current" /> Our Story
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
            About <span className="text-blue-600">ReadnRevise</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We are redefining the LMS landscape. Not just a portal for videos, but a 
            <span className="font-semibold text-slate-900"> digital workshop </span> 
            where software engineers are forged through grit and real-world implementation.
          </p>
        </div>
      </section>

      {/* WHAT WE DO - Split Layout */}
      <section className="py-24 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
            <h2 className="text-4xl font-bold text-slate-900 mb-6 relative">
              Bridging the Gap Between <br />
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Theory & Practice</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              ReadnRevise was born out of a simple frustration: Traditional learning is too passive. 
              We've built an ecosystem where students follow industry-standard workflows from day one.
            </p>
            <ul className="space-y-4">
              {['Industry-standard git workflows', 'Automated Peer-to-Admin reviews', 'Real-world project simulation'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-blue-600 w-5 h-5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 rounded-[2rem] aspect-video flex items-center justify-center p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-blue-600/10" />
            <div className="relative text-center">
               <div className="flex gap-4 justify-center mb-6">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-blue-400 border border-white/10 tracking-tighter font-bold text-xl">R</div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-blue-400 border border-white/10 tracking-tighter font-bold text-xl">N</div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-blue-400 border border-white/10 tracking-tighter font-bold text-xl">R</div>
               </div>
               <p className="text-blue-200/60 font-mono text-sm uppercase tracking-[0.3em]">The Implementation Engine</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - Bento Cards */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookOpen size={24} />}
              title="Structured Learning"
              desc="Step-by-step learning paths that align perfectly with modern industry requirements."
            />
            <FeatureCard
              icon={<Workflow size={24} />}
              title="Real Implementation"
              desc="Move beyond tutorials. Write code that solves real problems in a sandbox environment."
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="Team Collaboration"
              desc="High-performance team structures. Learn how to communicate, review, and ship as a unit."
            />
            <FeatureCard
              icon={<ShieldCheck size={24} />}
              title="Admin Monitoring"
              desc="Quality assurance at every level. Get direct feedback from mentors and senior admins."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Modern Steps */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">The Framework</h2>
            <p className="text-gray-500 mt-4">Four steps to engineering excellence.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard step="01" title="Learn" desc="Master core concepts via interactive modules." />
            <StepCard step="02" title="Apply" desc="Complete micro-tasks to reinforce knowledge." />
            <StepCard step="03" title="Build" desc="Develop end-to-end production applications." />
            <StepCard step="04" title="Audit" desc="Undergo rigorous code review and refinement." />
          </div>
        </div>
      </section>

      {/* MISSION - Impactful Dark Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10">
            <Rocket className="w-16 h-16 text-blue-100 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Our Mission</h2>
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-blue-50 leading-relaxed font-medium">
              "To transform how students learn software development by making it practical, 
              collaborative, and industry-relevant — ensuring they are job-ready from day one."
            </p>
            <div className="mt-12 flex justify-center gap-4">
               <div className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm">Founded 2024</div>
               <div className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm">Made for Builders</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-white">
      <CardHeader>
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold pt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-600 leading-relaxed text-sm">
        {desc}
      </CardContent>
    </Card>
  )
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="relative p-8 bg-white border border-slate-100 rounded-3xl hover:border-blue-200 transition-colors group">
      <span className="text-5xl font-black text-slate-100 absolute top-4 right-6 group-hover:text-blue-50 transition-colors">
        {step}
      </span>
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}