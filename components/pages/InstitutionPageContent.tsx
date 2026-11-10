'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users, ShieldCheck, BarChart, CheckCircle2 } from 'lucide-react'
import { useState } from "react"
import { motion } from "framer-motion"


export default function InstitutionPageContent() {
  const [showDemoForm, setShowDemoForm] = useState(false)

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
            <button
  onClick={() => setShowDemoForm(true)}
  className="px-8 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-xl"
>
  Book a Demo
</button>
{showDemoForm && (
  <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
    {/* Backdrop with Blur */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setShowDemoForm(false)}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
    />

    {/* Modal Card */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl relative z-10 border border-slate-100"
    >
      {/* Close Button */}
      <button
        onClick={() => setShowDemoForm(false)}
        className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
      >
        ✕
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Book a <span className="text-blue-600">Demo</span>
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          Experience the future of engineering education. Our team will reach out within 24 hours.
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 p-3 rounded-xl outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Work Email</label>
          <input
            type="email"
            placeholder="john@company.com"
            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 p-3 rounded-xl outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Phone</label>
            <input
              type="tel"
              placeholder="+91..."
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 p-3 rounded-xl outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Org</label>
            <input
              type="text"
              placeholder="IITB / Google"
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 p-3 rounded-xl outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] mt-4"
        >
          Confirm Demo Request
        </button>
        
        <p className="text-[10px] text-center text-slate-400 mt-4">
          By clicking submit, you agree to our Terms of Service.
        </p>
      </form>
    </motion.div>
  </div>
)}
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