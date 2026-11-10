"use client"

import React, { useEffect, useState, ChangeEvent } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { X, Plus, Rocket, Award, BrainCircuit, ChevronLeft, Sparkles } from "lucide-react"

const QuizSkills = dynamic(() => import("@/components/QuizSkills"), {
  ssr: false,
  loading: () => <div className="h-40 flex items-center justify-center animate-pulse text-slate-400">Loading Intelligence...</div>
})

export default function StudentSkillsPage() {
  const router = useRouter()
  const [skillText, setSkillText] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [message, setMessage] = useState("")

  const suggestions = ["JavaScript", "React", "TypeScript", "SQL", "Python", "Node.js", "Docker", "AWS"]

  useEffect(() => {
    const saved = localStorage.getItem("skills")
    if (saved) setSkills(JSON.parse(saved))
  }, [])

  const saveSkills = (next: string[]) => {
    setSkills(next)
    localStorage.setItem("skills", JSON.stringify(next))
  }

  const addSkill = (raw?: string) => {
    const s = (raw ?? skillText).trim()
    if (!s) { setMessage("⚠️ Enter a skill"); return; }
    if (skills.includes(s)) { setMessage("⚠️ Already added"); return; }

    saveSkills([...skills, s])
    setSkillText("")
    setMessage("✅ Skill added")
    setTimeout(() => setMessage(""), 2000)
  }

  const removeSkill = (s: string) => {
    saveSkills(skills.filter(x => x !== s))
    setMessage("❌ Skill removed")
    setTimeout(() => setMessage(""), 2000)
  }

  const profileProgress = Math.min(100, skills.length * 12.5) // 8 skills for 100%

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <button
              onClick={() => router.push("/student/dashboard")}
              className="group flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Design your <span className="text-blue-600">Skill Tree</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
              Define your tech stack to generate <span className="font-bold text-slate-700">AI-powered</span> assessments tailored for you.
            </p>
          </div>

          {/* PROGRESS BADGE */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Award size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Level</p>
              <p className="text-lg font-bold text-slate-800">{skills.length < 3 ? 'Novice' : skills.length < 6 ? 'Pro' : 'Architect'}</p>
            </div>
          </div>
        </div>

        {/* --- MAIN INTERACTION AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/60 bg-white overflow-hidden">
              <CardContent className="p-8 md:p-10 space-y-8">
                
                {/* INPUT BOX */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Sparkles size={20} />
                  </div>
                  <Input
                    value={skillText}
                    onChange={(e) => setSkillText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    placeholder="Search or add a skill..."
                    className="h-16 pl-12 pr-36 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 text-lg bg-slate-50/50 transition-all"
                  />
                  <Button 
                    onClick={() => addSkill()}
                    className="absolute right-2 top-2 h-12 px-8 rounded-xl bg-slate-900 hover:bg-blue-600 shadow-xl transition-all active:scale-95"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Add Skill
                  </Button>
                </div>

                {/* SUGGESTIONS PILLS */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Suggested for you</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => addSkill(s)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACTIVE SKILLS GRID */}
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4">Your Active Stack</p>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence mode="popLayout">
                      {skills.length === 0 ? (
                        <p className="text-slate-400 italic text-sm">No skills added yet...</p>
                      ) : (
                        skills.map(s => (
                          <motion.div
                            key={s}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="group flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-2xl"
                          >
                            <span className="text-sm font-bold text-blue-700">{s}</span>
                            <button 
                              onClick={() => removeSkill(s)}
                              className="text-blue-300 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR STATS */}
          <div className="space-y-6">
            <Card className="rounded-[2rem] border-none bg-slate-900 text-white p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                  <Rocket size={28} />
                </div>
                <h3 className="font-bold text-xl">Skill Status</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Profile Completion</span>
                    <span className="text-blue-400 font-bold">{profileProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${profileProgress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Adding <span className="text-white font-bold">8+ skills</span> unlocks the personalized "Architect" learning path.
                  </p>
                </div>
              </div>
            </Card>

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-blue-600 text-white text-center font-bold shadow-lg"
              >
                {message}
              </motion.div>
            )}
          </div>
        </div>

        {/* --- QUIZ SECTION --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-blue-600 rounded-full" />
             <h2 className="text-2xl font-black text-slate-900">Custom Assessments</h2>
          </div>
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/60 bg-white p-8 md:p-10">
            <QuizSkills skills={skills} />
          </Card>
        </div>

      </div>
    </div>
  )
}