"use client"

import React, { useEffect, useState, ChangeEvent } from "react"
import dynamic from "next/dynamic"
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
import { X, Plus } from "lucide-react"

const QuizSkills = dynamic(() => import("@/components/QuizSkills"), {
  ssr: false,
  loading: () => (
    <div className="p-4 text-sm text-foreground/60">
      Loading quizzes…
    </div>
  ),
})

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export default function StudentSkillsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [skillText, setSkillText] = useState("")
  const [skills, setSkills] = useState<string[]>([])

  const suggestions = [
    "JavaScript",
    "React",
    "TypeScript",
    "SQL",
    "Python",
    "Node.js",
    "HTML",
    "CSS",
    "Git",
  ]

  useEffect(() => {
    const u = safeParse(localStorage.getItem("lms_current_user"))
    setCurrentUser(u)
    if (u?.email) {
      const saved: string[] =
        safeParse(localStorage.getItem(`student_skills_${u.email}`)) || []
      setSkills(saved)
    }

    try {
      const params = new URLSearchParams(window.location.search)
      const hash = window.location.hash
      const shouldOpen =
        params.get("open") === "true" ||
        hash === "#add" ||
        hash === "#add-skill"

      if (shouldOpen) {
        setTimeout(() => {
          const panel = document.getElementById("add-skill-panel")
          if (panel)
            panel.scrollIntoView({ behavior: "smooth", block: "center" })
          const input = document.getElementById(
            "skill-input"
          ) as HTMLInputElement | null
          if (input) input.focus()
        }, 120)
      }
    } catch {}
  }, [])

  const saveSkills = (next: string[]) => {
    setSkills(next)
    if (currentUser?.email) {
      localStorage.setItem(
        `student_skills_${currentUser.email}`,
        JSON.stringify(next)
      )
    }
  }

  const addSkill = (raw?: string) => {
    const s = (raw ?? skillText).trim()
    if (!s) return
    if (skills.some(x => x.toLowerCase() === s.toLowerCase())) {
      setSkillText("")
      return
    }
    saveSkills([...skills, s])
    setSkillText("")
  }

  const removeSkill = (s: string) => {
    saveSkills(skills.filter(x => x !== s))
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addSkill()
  }

  const profileProgress = Math.min(100, skills.length * 12)

  return (
    <div className="relative min-h-screen px-4 py-10 bg-gradient-to-b from-[#0b0f2a] via-[#120c2f] to-background">
      {/* glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-10">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Showcase your skills
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-xl">
              Add skills to your profile and discover curated quizzes that help
              you validate and grow your expertise. Your skills are saved locally
              and appear across your dashboard.
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push("/student/dashboard")}
            className="text-white/80 hover:text-white"
          >
            Back to dashboard
          </Button>
        </div>

        {/* ADD SKILLS */}
        <Card className="rounded-3xl border bg-background/85 backdrop-blur shadow-2xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div
              id="add-skill-panel"
              className="rounded-2xl border border-emerald-300/30 bg-emerald-50/90 p-6 md:p-8"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    Add skills to your profile
                  </h3>
                  <p className="text-sm text-foreground/70 mt-1 mb-4">
                    Type a skill and press <b>Enter</b> or click <b>Add</b>.
                  </p>

                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
                        🔍
                      </span>
                      <Input
                        id="skill-input"
                        placeholder="Search for skill e.g. JavaScript"
                        value={skillText}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setSkillText(e.target.value)
                        }
                        onKeyDown={handleEnter}
                        className="pl-10 rounded-xl"
                      />
                    </div>

                    <Button
                      onClick={() => addSkill()}
                      className="rounded-full px-5 gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>

                  {/* suggestions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => addSkill(s)}
                        className="px-3 py-1.5 rounded-full bg-white border text-sm hover:bg-foreground/5 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="w-full lg:w-64">
                  <div className="rounded-2xl bg-white border p-4 shadow">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total skills
                        </p>
                        <p className="text-2xl font-semibold">{skills.length}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Profile progress
                        </p>
                        <div className="mt-2 w-28 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-emerald-600"
                            style={{ width: `${profileProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Adding skills helps surface relevant quizzes.
                    </p>
                  </div>
                </div>
              </div>

              {/* SKILL CHIPS */}
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  <p className="text-sm text-foreground/60">
                    No skills added yet.
                  </p>
                ) : (
                  skills.map(s => (
                    <div
                      key={s}
                      className="flex items-center gap-2 rounded-full bg-white border px-3 py-1"
                    >
                      <span className="text-sm font-medium">{s}</span>
                      <button
                        onClick={() => removeSkill(s)}
                        className="p-1 rounded-full hover:bg-foreground/5"
                      >
                        <X className="w-3 h-3 text-foreground/60" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QUIZZES */}
        <Card className="rounded-3xl border bg-background/85 backdrop-blur shadow-2xl">
          <CardHeader>
            <CardTitle>Quizzes for your skills</CardTitle>
            <CardDescription>
              Quizzes related to the skills you added are shown below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuizSkills skills={skills} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
