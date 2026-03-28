'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users, ShieldCheck, BarChart, CheckCircle2 } from 'lucide-react'

export default function InstitutionPageContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Corporate & Professional */}
      <section className="relative py-24 lg:py-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Enterprise Solutions
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
              Scale Your <span className="text-blue-600">Education</span> System
            </h1>
            <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empower your institution with a practical ecosystem. Bridge the gap between 
              academic theory and industry requirements with our structured project-based learning.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-xl">
                Book a Demo
              </button>
              <button className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl border border-blue-200 hover:border-blue-400 transition-all">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - Bento Grid Style */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900">Advanced Control Center</h2>
              <p className="text-gray-600 mt-2">Manage thousands of students with enterprise-grade monitoring tools.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature 
              icon={<Building className="w-6 h-6" />} 
              title="LMS Integration" 
              desc="Seamlessly sync with your existing infrastructure via API or Webhooks." 
            />
            <Feature 
              icon={<Users className="w-6 h-6" />} 
              title="Student Tracking" 
              desc="Real-time visibility into student commits, PRs, and project milestones." 
            />
            <Feature 
              icon={<ShieldCheck className="w-6 h-6" />} 
              title="Admin Monitoring" 
              desc="Role-based access control to oversee faculty and student performance." 
            />
            <Feature 
              icon={<BarChart className="w-6 h-6" />} 
              title="Performance Analytics" 
              desc="Generate detailed institutional reports and outcomes in one click." 
            />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - Two Column Layout */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full" />
            
            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h2 className="text-4xl font-bold text-white mb-8">Why ReadnRevise?</h2>
                <div className="space-y-6">
                  {[
                    "Industry-aligned curriculum structure",
                    "Automated grading and review workflows",
                    "Centralized dashboard for all departments",
                    "Dedicated support for institutional setup"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-slate-300">
                      <CheckCircle2 className="text-blue-400 w-6 h-6 flex-shrink-0" />
                      <span className="text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                <div className="space-y-4">
                  <div className="h-3 w-1/2 bg-blue-500/20 rounded-full" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-blue-500/10 rounded-2xl animate-pulse" />
                    <div className="h-20 bg-blue-500/20 rounded-2xl animate-pulse delay-75" />
                    <div className="h-20 bg-blue-500/10 rounded-2xl animate-pulse delay-150" />
                  </div>
                  <div className="h-3 w-3/4 bg-blue-500/20 rounded-full" />
                  <div className="h-32 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center justify-center text-blue-400 text-sm italic">
                    [ Interactive Analytics Dashboard ]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Feature({ icon, title, desc }: any) {
  return (
    <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 border-slate-200">
      <CardHeader className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-slate-900 leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 text-gray-600 leading-relaxed">
        {desc}
      </CardContent>
      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-blue-600 group-hover:w-full transition-all duration-500" />
    </Card>
  )
}