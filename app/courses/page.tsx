'use client'
import Courses from '@/components/courses'
import { motion } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 py-20">
        
        {/* --- HEADER SECTION --- */}
        <div className="relative mb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600 border border-blue-100"
          >
            <Sparkles size={16} />
            <span>Elevate Your Engineering Career</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6"
          >
            Master the <span className="text-blue-600">Tech Stack</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-lg text-slate-500 leading-relaxed"
          >
            Production-grade courses designed by engineers, for engineers. 
            Deep dive into architecture, scalability, and modern frameworks.
          </motion.p>

          {/* --- SEARCH BAR UI (Aesthetic Only) --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-100 focus-within:border-blue-400 transition-all"
          >
            <div className="pl-3 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search for 'System Design' or 'Next.js'..." 
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <button className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-blue-600 transition-colors">
              Search
            </button>
          </motion.div>
        </div>

        {/* --- COURSES COMPONENT --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* Aapka existing component call */}
          <Courses />
        </motion.div>

      </div>

      {/* Footer Decoration */}
      <div className="mt-20 border-t border-slate-100 bg-slate-50/50 py-10 text-center">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">
          New courses added every month • Secure access
        </p>
      </div>
    </div>
  )
}