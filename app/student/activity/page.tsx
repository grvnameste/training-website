// app/student/activity/page.tsx
import StudentActivity from '@/components/StudentActivity'

export default function StudentActivityPage() {
  return (
    <div className="relative min-h-screen px-4 py-10 bg-gradient-to-b from-[#0b0f2a] via-[#120c2f] to-background">
      {/* glow effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Activity
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Track your recent learning activity
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border bg-background/85 backdrop-blur shadow-2xl p-6">
          <StudentActivity />
        </div>
      </div>
    </div>
  )
}
