"use client"

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Clipboard, Eye, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

type Quiz = {
  id: string;
  title: string;
  skills: string[];
  questionsCount: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  durationMinutes?: number;
  estimatedPassPct?: number; // small extra meta for UI
};

const DEFAULT_QUIZZES: Quiz[] = [
  { id: "q1", title: "JavaScript Basics", skills: ["javascript", "frontend"], questionsCount: 20, difficulty: "Easy", durationMinutes: 15, estimatedPassPct: 82 },
  { id: "q2", title: "React & State Management", skills: ["react", "redux", "frontend"], questionsCount: 25, difficulty: "Medium", durationMinutes: 25, estimatedPassPct: 70 },
  { id: "q3", title: "TypeScript Practical", skills: ["typescript", "javascript"], questionsCount: 18, difficulty: "Medium", durationMinutes: 20, estimatedPassPct: 75 },
  { id: "q4", title: "Node.js APIs", skills: ["nodejs", "backend"], questionsCount: 22, difficulty: "Medium", durationMinutes: 30, estimatedPassPct: 68 },
  { id: "q5", title: "Mobile Automation (Appium)", skills: ["appium", "automation", "mobile"], questionsCount: 30, difficulty: "Hard", durationMinutes: 45, estimatedPassPct: 52 },
];

const STORAGE_KEY = "student:quizBank_v2";

const difficultyStyles = {
  Easy: "bg-emerald-50 text-emerald-700",
  Medium: "bg-yellow-50 text-yellow-700",
  Hard: "bg-rose-50 text-rose-700",
  Unknown: "bg-gray-50 text-gray-700",
};

export default function QuizSkills({ skills }: { skills: string[] }) {
  const router = useRouter();
  const [quizBank, setQuizBank] = useState<Quiz[]>(DEFAULT_QUIZZES);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "duration" | "difficulty">("relevance");

  useEffect(() => {
    try {
      const q = localStorage.getItem(STORAGE_KEY);
      if (q) setQuizBank(JSON.parse(q));
    } catch (e) {
      // keep defaults
      console.warn("Failed to load quiz bank:", e);
    }
  }, []);

  const normalise = (s: string) => s.trim().toLowerCase();

  const matched = useMemo(() => {
    if (!skills || skills.length === 0) return [] as Quiz[];
    const lowered = new Set(skills.map(normalise));
    const filtered = quizBank.filter((q) => q.skills.some((sk) => lowered.has(normalise(sk))));

    // quick search
    const searched = query.trim()
      ? filtered.filter((q) => {
          const qLower = q.title.toLowerCase();
          return qLower.includes(query.toLowerCase()) || q.skills.join(" ").toLowerCase().includes(query.toLowerCase());
        })
      : filtered;

    // sort
    const sorted = [...searched].sort((a, b) => {
      if (sortBy === "relevance") return (b.estimatedPassPct ?? 0) - (a.estimatedPassPct ?? 0);
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      if (sortBy === "duration") return (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0);
      if (sortBy === "difficulty") {
        const rank = (d?: string) => (d === "Easy" ? 0 : d === "Medium" ? 1 : d === "Hard" ? 2 : 3);
        return rank(a.difficulty) - rank(b.difficulty);
      }
      return 0;
    });

    return sorted;
  }, [skills, quizBank, query, sortBy]);

  function openQuiz(q: Quiz) {
    router.push(`/student/quiz/${q.id}`);
  }

  function copyId(id: string) {
    navigator.clipboard?.writeText(id);
  }

  const skillsLabel = skills && skills.length ? skills.join(", ") : "No skills added";

  // small UI-only helper
  const Card = ({ children }: { children: React.ReactNode }) => (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex flex-col md:flex-row items-stretch bg-white border rounded-2xl shadow-sm hover:shadow-lg overflow-hidden"
    >
      {children}
    </motion.article>
  );

  if (!skills || skills.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-br from-white to-gray-50 text-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-semibold text-xl">
            🙂
          </div>
          <div>
            <div className="font-semibold text-lg">Add skills to get personalised quizzes</div>
            <p className="text-sm text-foreground/70 mt-1">When you add skills, we'll surface focused quizzes to help you practise and measure progress.</p>
            <div className="mt-3 text-xs text-foreground/60">Example: <span className="px-2 py-1 bg-foreground/5 rounded">react, nodejs, typescript</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (matched.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-gray-200 bg-white text-gray-700">
        <div className="text-sm">No quizzes matched your skills yet. Consider creating a quiz or broadening your skill tags.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold">Recommended Quizzes</h3>
          <p className="text-sm text-foreground/70 mt-1">Quizzes matched to: <span className="font-medium">{skillsLabel}</span></p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-foreground/60">{matched.length} result{matched.length !== 1 ? "s" : ""}</div>
        </div>
      </header>

      {/* controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        <div className="flex-1 flex items-center gap-2 bg-white border rounded-full px-3 py-2 shadow-sm">
          <input
            aria-label="Search quizzes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quizzes or skills — e.g., react, nodejs"
            className="flex-1 text-sm bg-transparent outline-none"
          />
          <button onClick={() => setQuery("")} className="text-xs px-2 py-1 rounded-md hover:bg-gray-100">Clear</button>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Sort quizzes"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm bg-white border rounded-md px-3 py-2 shadow-sm"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="newest">Sort: Newest</option>
            <option value="duration">Sort: Duration</option>
            <option value="difficulty">Sort: Difficulty</option>
          </select>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matched.map((q) => (
          <Card key={q.id}>
            <div className="flex-1 p-5 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-lg font-semibold truncate">{q.title}</h4>
                  <p className="text-sm text-foreground/70 mt-1 truncate">{q.questionsCount} questions • {q.durationMinutes ?? "~"} mins</p>
                </div>

                <div className={`px-3 py-1 rounded-md text-xs font-semibold ${difficultyStyles[q.difficulty ?? "Unknown" as keyof typeof difficultyStyles]}`}>
                  {q.difficulty ?? "Unknown"}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {q.skills.map((sk) => (
                  <span key={sk} className="text-xs px-2 py-1 bg-foreground/5 text-foreground/80 rounded-full">{sk}</span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm text-foreground/70">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{q.durationMinutes ?? "--"} mins</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{q.estimatedPassPct ?? "--"}% pass</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-foreground/60">Focus: Fundamentals · Practical questions · Timed practice</div>
            </div>

            <div className="w-full md:w-48 p-4 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col items-stretch gap-3 bg-gradient-to-b from-white to-gray-50">
              <button
                onClick={() => openQuiz(q)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <Play className="w-4 h-4" /> Start Quiz
              </button>

              <button
                onClick={() => copyId(q.id)}
                title="Copy quiz id"
                className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
              >
                <Clipboard className="w-4 h-4 text-foreground/70" /> Copy ID
              </button>

              <button
                onClick={() => router.push(`/student/quiz/${q.id}?preview=true`)}
                className="mt-auto text-xs text-foreground/60 underline underline-offset-2"
              >
                <Eye className="inline-block mr-2 w-3 h-3" /> View details
              </button>
            </div>
          </Card>
        ))}
      </div>

      <footer className="text-xs text-foreground/60">Tip: Create custom quizzes to cover advanced topics and track progress over time.</footer>
    </div>
  );
}
