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
}