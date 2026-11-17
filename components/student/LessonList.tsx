import Link from 'next/link'
import { CheckCircle2, PlayCircle } from 'lucide-react'

interface Lesson {
  id: string
  title: string
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface LessonListProps {
  sections: Section[]
  currentLessonId: string
  courseId: string
  completedLessonIds?: string[]
}

export function LessonList({
  sections,
  currentLessonId,
  courseId,
  completedLessonIds = [],
}: LessonListProps) {
  const completedSet = new Set(completedLessonIds)

  return (
    <div className="max-h-[420px] overflow-y-auto p-3 space-y-1">
      {sections.map((section, sIndex) => (
        <div key={section.id} className="space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            {section.title}
          </div>

          {section.lessons.map((lesson, lIndex) => {
            const globalIndex =
              sections
                .slice(0, sIndex)
                .reduce((acc, s) => acc + s.lessons.length, 0) + lIndex

            const isCurrent = lesson.id === currentLessonId
            const isDone = completedSet.has(lesson.id)

            return (
              <Link
                key={lesson.id}
                href={`/student/courses/${courseId}/play/${lesson.id}`}
              >
                <div
                  className={`ml-2 px-3 py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span className="truncate">
                    {globalIndex + 1}. {lesson.title}
                  </span>
                  {isDone ? (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isCurrent ? 'text-white' : 'text-emerald-600'
                      }`}
                    />
                  ) : isCurrent ? (
                    <PlayCircle className="w-3.5 h-3.5 shrink-0 text-white" />
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}
