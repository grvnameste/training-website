"use client"

import StudentActivity from '@/components/StudentActivity'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, History, Zap, BarChart3 } from 'lucide-react'

export default function StudentActivityPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        
        {/* --- NAVIGATION & HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button
              onClick={() => router.push("/student/dashboard")}
              className="group flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Learning <span className="text-blue-600">Journey</span>
              <History className="text-blue-600/20" size={32} />
            </h1>
            <p className="text-slate-500 font-medium italic">
              "Consistency is the key to mastery."
            </p>
          </div>

          {/* QUICK STATS (Visual Only) */}
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streak</p>
                <p className="text-lg font-bold text-slate-800">12 Days</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks</p>
                <p className="text-lg font-bold text-slate-800">248 Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- ACTIVITY TIMELINE CARD --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />

          <div className="rounded-[2.5rem] border-none bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
            {/* Header of the Card */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                Recent Updates
              </h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Live Feed
              </span>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8">
              <StudentActivity />
            </div>
          </div>
        </motion.div>

        {/* FOOTER INFO */}
        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Activity logs are kept for the last 90 days to optimize your performance.
          </p>
        </div>

      </div>
    </div>
  )
}