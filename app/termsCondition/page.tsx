import React from 'react'
import { Scale, UserCheck, Copyright, AlertCircle, RefreshCw, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermsCondition() {
  const lastUpdated = "April 19, 2026"

  const sections = [
    {
      id: "platform",
      icon: <Scale className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
      title: "1. Use of Platform",
      content: "You agree to use the platform only for lawful purposes. Unauthorized access, data mining, or any action that disrupts our services is strictly prohibited."
    },
    {
      id: "accounts",
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      title: "2. User Accounts",
      content: "Account security is your responsibility. You must provide accurate information and immediately notify us of any unauthorized use of your credentials."
    },
    {
      id: "intellectual",
      icon: <Copyright className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      title: "3. Intellectual Property",
      content: "All source code, designs, and content on ReadNRevise are our exclusive property. Reproduction or distribution without explicit permission is forbidden."
    },
    {
      id: "liability",
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      bg: "bg-red-50",
      title: "4. Limitation of Liability",
      content: "To the maximum extent permitted by law, ReadNRevise shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform."
    },
    {
      id: "updates",
      icon: <RefreshCw className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      title: "5. Changes to Terms",
      content: "We evolve quickly. We may update these terms at any time. Your continued use of the dashboard post-update constitutes full acceptance of the revised terms."
    }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      {/* Accent Header Line */}
      <div className="h-1.5 bg-slate-900" />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        
        {/* Breadcrumb */}
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors mb-12">
          <ArrowLeft size={14} className="mr-2" />
          Back To Home
        </Link>

        {/* Hero Title */}
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
              <FileText className="text-white w-6 h-6" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Governance</h4>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8">
            Terms of <span className="text-slate-400 font-medium italic">Service</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold">
            <span className="px-3 py-1 bg-slate-100 rounded-md border border-slate-200">Effective: {lastUpdated}</span>
            <span className="text-slate-400 underline underline-offset-4 cursor-help">Download PDF</span>
          </div>
        </header>

        {/* Content Sections */}
        <div className="space-y-6">
          <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
            By accessing <span className="text-slate-900">ReadNRevise</span>, you enter into a binding legal agreement. Please review these protocols carefully before proceeding with the platform.
          </p>

          <div className="grid gap-6">
            {sections.map((section) => (
              <div 
                key={section.id}
                className="group p-8 border border-slate-100 rounded-[2rem] bg-[#F9FAFB] hover:bg-white hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl ${section.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                      {section.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed font-medium">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <footer className="mt-20 pt-12 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm">
            Questions regarding our governance? <br className="md:hidden" />
            <Link href="mailto:support@readnrevise.com" className="text-slate-900 font-bold hover:underline underline-offset-4">
              Contact Legal Dept.
            </Link>
          </p>
        </footer>

      </main>
    </div>
  )
}