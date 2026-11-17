<<<<<<< HEAD
'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import {
  X,
  Plus,
  Rocket,
  Award,
  ChevronLeft,
  Sparkles,
  Undo2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

const QuizSkills = dynamic(() => import('@/components/QuizSkills'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center animate-pulse text-slate-400 font-medium text-sm">
      Loading Custom Intelligence...
    </div>
  ),
})

export default function StudentSkillsPage() {
  const router = useRouter()
  const [skillText, setSkillText] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [lastRemovedSkill, setLastRemovedSkill] = useState<{ name: string; index: number } | null>(null)

  const suggestions = [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'SQL',
    'PostgreSQL',
    'Docker',
    'AWS',
    'Python',
  ]

  useEffect(() => {
    let active = true

    // Fast initial hydration from localStorage
    let localSkills: string[] = []
    try {
      const saved = localStorage.getItem('skills')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          localSkills = parsed
          setSkills(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to parse skills from local storage:', e)
    }

    // Authoritative hydration from database profile
    ;(async () => {
      try {
        const res = await fetch('/api/student/profile')
        if (!res.ok) return
        const profile = await res.json()
        if (!active) return

        if (Array.isArray(profile?.skills) && profile.skills.length > 0) {
          setSkills(profile.skills)
          try {
            localStorage.setItem('skills', JSON.stringify(profile.skills))
          } catch {
            // ignore
          }
        } else if (localSkills.length > 0) {
          // Backfill DB from existing localStorage skills
          await fetch('/api/student/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: localSkills }),
          })
        }
      } catch (e) {
        console.warn('Failed to sync skills with profile:', e)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const persistSkillsToServer = async (next: string[]) => {
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: next }),
      })
      if (!res.ok) {
        console.warn('Profile skills update returned non-OK status:', res.status)
      }
    } catch (e) {
      console.warn('Failed to persist skills to server:', e)
    }
  }

  const saveSkills = (next: string[]) => {
    setSkills(next)
    try {
      localStorage.setItem('skills', JSON.stringify(next))
    } catch (e) {
      console.warn('Failed to persist skills to local storage:', e)
    }
    void persistSkillsToServer(next)
  }

  const addSkill = (raw?: string) => {
    const s = (raw ?? skillText).trim()
    if (!s) {
      toast.error('Please enter a skill name.')
      return
    }

    if (skills.some((existing) => existing.toLowerCase() === s.toLowerCase())) {
      toast.info(`"${s}" is already in your stack.`)
      return
    }

    const updated = [...skills, s]
    saveSkills(updated)
    setSkillText('')
    toast.success(`Added "${s}" to your tech stack.`)
  }

  const removeSkill = (s: string) => {
    const skillIndex = skills.findIndex((x) => x === s)
    const updated = skills.filter((x) => x !== s)
    saveSkills(updated)

    setLastRemovedSkill({ name: s, index: skillIndex })

    toast('Skill removed', {
      description: `"${s}" was removed from your skill tree.`,
      action: {
        label: 'Undo',
        onClick: () => undoRemoveSkill(s, skillIndex),
      },
      duration: 6000,
    })
  }

  const undoRemoveSkill = (skillToRestore: string, targetIndex: number) => {
    setSkills((prev) => {
      if (prev.includes(skillToRestore)) return prev
      const copy = [...prev]
      if (targetIndex >= 0 && targetIndex <= copy.length) {
        copy.splice(targetIndex, 0, skillToRestore)
      } else {
        copy.push(skillToRestore)
      }
      try {
        localStorage.setItem('skills', JSON.stringify(copy))
      } catch (e) {
        console.warn('Failed to persist skills to local storage:', e)
      }
      void persistSkillsToServer(copy)
      return copy
    })

    setLastRemovedSkill(null)
    toast.success(`Restored "${skillToRestore}" to your stack!`)
  }

  const profileProgress = Math.min(100, Math.round((skills.length / 8) * 100))
  const masteryRank = skills.length < 3 ? 'Novice' : skills.length < 6 ? 'Pro' : 'Architect'

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="group flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Student Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Design your <span className="text-blue-600">Skill Tree</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed">
            Define your engineering tech stack to generate personalized SDLC assessments and benchmark interview modules.
          </p>
        </div>

        {/* PROGRESS BADGE */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-4 self-start md:self-auto">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Level</p>
            <p className="text-lg font-black text-slate-900">{masteryRank}</p>
          </div>
        </div>
      </div>

      {/* RECENTLY REMOVED UNDO BANNER */}
      {lastRemovedSkill && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span>
              Removed <strong>{lastRemovedSkill.name}</strong> from your profile.
            </span>
          </div>
          <button
            type="button"
            onClick={() => undoRemoveSkill(lastRemovedSkill.name, lastRemovedSkill.index)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs"
          >
            <Undo2 size={14} /> Undo Removal
          </button>
        </div>
      )}

      {/* MAIN INTERACTION AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* INPUT BOX */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                  <Sparkles size={18} />
                </div>
                <Input
                  value={skillText}
                  onChange={(e) => setSkillText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Search or type a new engineering skill..."
                  className="h-14 pl-11 pr-32 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base bg-slate-50/50 transition-all"
                />
                <Button
                  onClick={() => addSkill()}
                  className="absolute right-2 top-2 h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-all active:scale-95 text-xs gap-1.5"
                >
                  <Plus size={15} /> Add Skill
                </Button>
              </div>

              {/* SUGGESTIONS PILLS */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Suggested for software architects
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => {
                    const alreadyAdded = skills.includes(s)
                    return (
                      <button
                        key={s}
                        disabled={alreadyAdded}
                        onClick={() => addSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          alreadyAdded
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                        }`}
                      >
                        {alreadyAdded ? `✓ ${s}` : `+ ${s}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ACTIVE SKILLS GRID */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Your Active Stack ({skills.length})
                  </p>
                  {skills.length > 0 && (
                    <span className="text-xs text-slate-400">
                      Tap the × icon to remove a skill (undo available)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5 min-h-[48px]">
                  <AnimatePresence mode="popLayout">
                    {skills.length === 0 ? (
                      <p className="text-slate-400 italic text-sm py-2">
                        No skills configured yet. Add your core programming languages and frameworks above.
                      </p>
                    ) : (
                      skills.map((s) => (
                        <motion.div
                          key={s}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className="group flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-xl shadow-2xs"
                        >
                          <span className="text-xs font-bold text-blue-900">{s}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(s)}
                            className="text-blue-400 hover:text-red-600 p-0.5 rounded transition-colors"
                            title={`Remove ${s}`}
                          >
                            <X size={14} />
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
          <Card className="border border-slate-200 shadow-xs bg-slate-900 text-white p-6 rounded-2xl">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-2.5 bg-blue-600/30 rounded-xl text-blue-400">
                <Rocket size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base">Stack Readiness</h3>
                <p className="text-xs text-slate-400">Curriculum alignment indicator</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Profile Completion</span>
                  <span className="text-blue-400 font-bold">{profileProgress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profileProgress}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Adding <span className="text-white font-bold">8+ skills</span> qualifies your portfolio for the
                  "Senior Architect" capstone tier.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* QUIZ SECTION */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Skill Assessments</h2>
          <p className="text-xs md:text-sm text-slate-500">
            Interactive quizzes generated dynamically based on your active stack.
          </p>
        </div>

        <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl p-6 md:p-8">
          <QuizSkills skills={skills} />
        </Card>
      </div>
    </div>
  )
=======
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
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
}