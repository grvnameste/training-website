//app/education/free-courses/page.tsx
'use client'
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PlayCircle, Star, Users, Layout, Database,ArrowRight, Layers } from "lucide-react"

const courses = [
  { 
    title: "React for Beginners", 
    level: "Beginner", 
    icon: <Layout className="text-blue-600"/>,
    lessons: 24,
    students: "1.2k",
    gradient: "from-blue-500/10 to-indigo-500/10"
  },
  { 
    title: "Advanced Java & Spring", 
    level: "Intermediate", 
    icon: <Layers className="text-orange-600"/>,
    lessons: 48,
    students: "800+",
    gradient: "from-orange-500/10 to-red-500/10"
  },
  { 
    title: "Fullstack MERN Masterclass", 
    level: "Advanced", 
    icon: <Database className="text-green-600"/>,
    lessons: 92,
    students: "2.5k",
    gradient: "from-green-500/10 to-emerald-500/10"
  },
]

export default function FreeCoursesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8 flex items-center gap-2 text-sm">
  <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors">
    Home
  </Link>

  <ChevronRight size={14} className="text-slate-300" />

  <Link href="/education/blog" className="text-slate-400 hover:text-blue-600 transition-colors">
    Education
  </Link>

  <ChevronRight size={14} className="text-slate-300" />

  <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-medium">
    Free Courses
  </span>
</div>
        
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-blue-600 font-bold tracking-[0.2em] uppercase text-xs"
          >
            Knowledge for everyone
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mt-4 mb-6"
          >
            Zero Cost. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Infinite Impact.</span>
          </motion.h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
            Production-grade courses taught by industry veterans. No hidden fees, ever.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${course.gradient} -z-0 opacity-50`} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                  {course.icon}
                </div>
                
                <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {course.level}
                </span>

                <h2 className="text-2xl font-black text-slate-900 mt-4 mb-4 leading-tight">
                  {course.title}
                </h2>

                <div className="flex items-center gap-6 text-sm text-slate-500 mb-10">
                  <div className="flex items-center gap-1.5"><PlayCircle size={16}/> {course.lessons} Lessons</div>
                  <div className="flex items-center gap-1.5"><Users size={16}/> {course.students}</div>
                </div>

                <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white transition-all duration-300 font-bold group">
                  Start Course
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}