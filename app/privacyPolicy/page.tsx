'use client'
import React from 'react'
import { ShieldCheck, Lock, Eye, Share2, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicy() {
  const lastUpdated = "April 19, 2026"

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 selection:bg-blue-100">
      {/* Top Decoration Bar */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-12 group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShieldCheck className="text-blue-600 w-6 h-6" />
            </div>
            <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">Legal Documentation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            At <span className="text-slate-900 font-semibold">ReadNRevise</span>, we respect your privacy and are committed to protecting your personal information through industry-standard protocols.
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-slate-400 border-y border-slate-100 py-4">
            <span>Last Updated: <span className="text-slate-900 font-medium">{lastUpdated}</span></span>
            <span className="h-4 w-[1px] bg-slate-200" />
            <span>Version 1.0.2-beta</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
          
          {/* Main Content Area */}
          <div className="space-y-12 leading-relaxed">
            
            <section id="collection">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold">1. Information We Collect</h2>
              </div>
              <p className="text-slate-600 mb-4 pl-13">
                To provide a high-performance learning environment, we collect specific data points during your interaction with the platform:
              </p>
              <ul className="list-none space-y-3 pl-13">
                {['Account details (Name, Email via Auth providers)', 'Technical logs (IP, Browser type, Activity timestamps)', 'Learning Progress (Commits, Sprint participation, Quiz results)'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section id="usage">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold">2. How We Use Your Data</h2>
              </div>
              <p className="text-slate-600 pl-13">
                Your data is exclusively used to personalize your learning trajectory, facilitate peer-reviews within your Agile Squad, and provide data-driven insights on your engineering progress.
              </p>
            </section>

            <section id="security">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold">3. Data Security</h2>
              </div>
              <p className="text-slate-600 pl-13">
                We implement industry-standard AES-256 encryption and secure OAuth 2.0 protocols to ensure your data remains confidential. We never store plain-text passwords or sensitive financial information on our primary servers.
              </p>
            </section>

            <section id="contact" className="p-8 bg-blue-600 rounded-[2.5rem] text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Questions or Concerns?</h2>
                <p className="text-blue-100 mb-8 max-w-md">
                  Our legal and support teams are available to clarify any queries regarding your data rights.
                </p>
                <Link href="mailto:support@readnrevise.com">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-8 py-6 h-auto font-bold shadow-lg">
                    <Mail className="mr-2 w-5 h-5" />
                    Contact Support
                  </Button>
                </Link>
              </div>
              {/* Abstract background shape */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </section>

          </div>

          {/* Sidebar Navigation (Visible on Large Screens) */}
          <aside className="hidden lg:block sticky top-24 h-fit">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Quick Navigation</h4>
              <nav className="space-y-4">
                {['Collection', 'Usage', 'Security', 'Contact'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`}
                    className="block text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-center">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Want to know how we handle cookies? Read our Cookie Policy.
              </p>
              <button className="text-xs font-bold text-white underline decoration-blue-500 underline-offset-4">
                Read More
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}