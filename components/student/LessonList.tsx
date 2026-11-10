import Link from 'next/link'

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
}

export function LessonList({ sections, currentLessonId, courseId }: LessonListProps) {
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

                        return (
                            <Link
                                key={lesson.id}
                                href={`/student/courses/${courseId}/play/${lesson.id}`}
                            >
                                <div
                                    className={`ml-2 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${lesson.id === currentLessonId
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'hover:bg-neutral-100 text-neutral-700'
                                        }`}
                                >
                                    {globalIndex + 1}. {lesson.title}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
