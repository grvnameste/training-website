// app/student/activity/page.tsx
import StudentActivity from '@/components/StudentActivity'

export default function StudentActivityPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Activity
        </h1>
        <p className="mt-1 text-sm text-foreground/70">
          Track your recent learning activity
        </p>
      </div>

      {/* Content Card */}
      <div className="rounded-3xl border bg-background/80 backdrop-blur shadow-2xl p-6">
        <StudentActivity />
      </div>
    </div>
  )
}
