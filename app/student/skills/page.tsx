"use client"

import React, { useEffect, useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QuizSkills from "@/components/QuizSkills";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

export default function StudentSkillsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [skillText, setSkillText] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
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
  ];

  useEffect(() => {
    const u = safeParse(localStorage.getItem("lms_current_user"));
    setCurrentUser(u);
    if (u?.email) {
      const saved: string[] = safeParse(localStorage.getItem(`student_skills_${u.email}`)) || [];
      setSkills(saved);
    }

    // if navigated with ?open=true or #add, scroll & focus add-skill panel
    try {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const shouldOpen = params.get("open") === "true" || hash === "#add" || hash === "#add-skill";
      if (shouldOpen) {
        setTimeout(() => {
          const panel = document.getElementById("add-skill-panel");
          if (panel) panel.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = document.getElementById("skill-input") as HTMLInputElement | null;
          if (input) input.focus();
        }, 120);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveSkills = (next: string[]) => {
    setSkills(next);
    if (currentUser?.email) {
      localStorage.setItem(`student_skills_${currentUser.email}`, JSON.stringify(next));
    }
  };

  const addSkill = (raw?: string) => {
    const s = (raw ?? skillText).trim();
    if (!s) return;
    // avoid duplicates case-insensitively
    const exists = skills.some((x) => x.toLowerCase() === s.toLowerCase());
    if (exists) {
      setSkillText("");
      return;
    }
    const next = [...skills, s];
    saveSkills(next);
    setSkillText("");
  };

  const removeSkill = (s: string) => {
    const next = skills.filter((x) => x !== s);
    saveSkills(next);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addSkill();
  };

  const profileProgress = Math.min(100, skills.length * 12);

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Showcase your skills</h1>
          <p className="mt-2 text-sm text-foreground/70 max-w-xl">
            Add skills to your profile and discover curated quizzes that help you validate and grow your expertise.
            Your skills are saved locally and will appear across your dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/student/dashboard")} className="px-3 py-2">
            Back to dashboard
          </Button>
        </div>
      </div>

      {/* add skills panel */}
      <Card className="shadow-sm">
        <CardContent className="space-y-6">
          <div id="add-skill-panel" className="bg-emerald-50/80 rounded-lg p-6 md:p-8 border border-emerald-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Add skills to your profile</h3>
                <p className="text-sm text-foreground/70 mb-3">
                  Type a skill and press <span className="font-medium">Enter</span> or click{" "}
                  <span className="font-medium">Add</span>. Use suggested skills to get started quickly.
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">🔍</span>
                    <Input
                      id="skill-input"
                      aria-label="Add skill"
                      placeholder="Search for skill e.g. JavaScript"
                      value={skillText}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSkillText(e.target.value)}
                      onKeyDown={handleEnter}
                      className="pl-10 py-3 shadow-sm"
                    />
                  </div>

                  <Button onClick={() => addSkill()} className="px-5 py-2 flex items-center gap-2" aria-label="Add skill">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>

                {/* suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="text-sm px-3 py-1.5 rounded-full bg-white border border-foreground/10 hover:bg-foreground/5 transition shadow-xs"
                      aria-label={`Add suggested skill ${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* summary card on right */}
              <div className="w-full md:w-64 mt-4 md:mt-0">
                <div className="rounded-lg bg-white border border-foreground/10 p-4 h-full shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-foreground/60">Total skills</div>
                      <div className="text-2xl font-semibold text-foreground mt-1">{skills.length}</div>
                    </div>
                    <div className="text-sm text-foreground/60 text-right">
                      <div>Profile progress</div>
                      <div className="mt-2 w-28 h-2 bg-foreground/5 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-emerald-600"
                          style={{ width: `${profileProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/60 mt-3">
                    Adding skills helps us surface relevant quizzes and learning paths.
                  </p>
                </div>
              </div>
            </div>

            {/* skill chips area (full width below on small screens) */}
            <div className="mt-5">
              <div className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  <div className="text-sm text-foreground/60 px-3 py-2">No skills added yet.</div>
                ) : (
                  skills.map((s) => (
                    <div
                      key={s}
                      className="flex items-center gap-2 bg-white border border-foreground/10 rounded-full px-3 py-1 shadow-xs"
                    >
                      <span className="text-sm font-medium text-foreground">{s}</span>
                      <button
                        onClick={() => removeSkill(s)}
                        aria-label={`Remove ${s}`}
                        className="p-1 rounded-full hover:bg-foreground/5"
                        title={`Remove ${s}`}
                      >
                        <X className="w-3 h-3 text-foreground/60" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* quizzes */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quizzes for your skills</CardTitle>
          <CardDescription className="text-sm">
            Quizzes related to the skills you added are shown below. Start any quiz to test your knowledge.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <QuizSkills skills={skills} />
        </CardContent>
      </Card>
    </div>
  )
}
