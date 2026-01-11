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
      const saved =
        safeParse(localStorage.getItem(`student_skills_${u.email}`)) || []
      setSkills(saved)
    }
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
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Showcase your skills
          </h1>
          <p className="mt-2 text-sm text-foreground/70 max-w-xl">
            Add skills to your profile and unlock curated quizzes to validate
            your knowledge.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/student/dashboard")}
        >
          Back to dashboard
        </Button>
      </div>

      {/* ADD SKILLS */}
      <Card className="rounded-3xl border bg-background/80 backdrop-blur shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold">
                  Add skills to your profile
                </h3>
                <p className="text-sm text-foreground/70 mt-1 mb-4">
                  Type a skill and press <b>Enter</b> or click <b>Add</b>.
                </p>

                <div className="flex gap-3">
                  <Input
                    id="skill-input"
                    placeholder="e.g. JavaScript, React, SQL"
                    value={skillText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSkillText(e.target.value)
                    }
                    onKeyDown={handleEnter}
                    className="rounded-xl"
                  />

                  <Button
                    onClick={() => addSkill()}
                    className="rounded-full px-6"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>

                {/* suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="px-3 py-1.5 rounded-full border text-sm hover:bg-muted transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="rounded-2xl bg-background border p-5">
                <p className="text-xs text-muted-foreground">Total skills</p>
                <p className="text-3xl font-semibold">{skills.length}</p>

                <p className="text-xs text-muted-foreground mt-4">
                  Profile progress
                </p>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-primary"
                    style={{ width: `${profileProgress}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Adding skills improves quiz recommendations.
                </p>
              </div>
            </div>

            {/* SKILLS */}
            <div className="mt-6 flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills added yet.
                </p>
              ) : (
                skills.map(s => (
                  <div
                    key={s}
                    className="flex items-center gap-2 rounded-full border px-3 py-1"
                  >
                    <span className="text-sm">{s}</span>
                    <button
                      onClick={() => removeSkill(s)}
                      className="p-1 rounded-full hover:bg-muted"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUIZZES */}
      <Card className="rounded-3xl border bg-background/80 backdrop-blur shadow-2xl">
        <CardHeader>
          <CardTitle>Quizzes for your skills</CardTitle>
          <CardDescription>
            Practice quizzes based on the skills you added.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizSkills skills={skills} />
        </CardContent>
      </Card>
    </div>
  )
}
