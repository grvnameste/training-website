import { StageItem } from './StageItem'
import { useRouter } from 'next/navigation'

interface CapstoneSectionProps {
    capstoneCourse: { id: string; title: string } | null
    capstoneStage: number
    stage3Submitted: boolean
    meeting: any
}

export function CapstoneSection({
    capstoneCourse,
    capstoneStage,
    stage3Submitted,
    meeting
}: CapstoneSectionProps) {
    const router = useRouter()

    const isLocked = (stage: number) => {
        return capstoneStage < stage
    }

    if (!capstoneCourse) return null

    return (
        <div className="mt-3 rounded-2xl border border-blue-200 bg-white p-4 space-y-3 shadow-sm">
            {/* HEADER */}
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-base">
                    🎯
                </div>
                <div>
                    <p className="text-xs font-bold text-blue-700">
                        Capstone Project
                    </p>
                    <p className="text-[10px] text-neutral-500">
                        Apply everything you’ve learned in a real project
                    </p>
                </div>
            </div>

            {/* STAGES */}
            <div className="space-y-2">
                <StageItem
                    title="Stage 1 – Requirements"
                    unlocked
                    completed={capstoneStage > 1}
                    meeting={meeting}
                    onClick={() =>
                        router.push(`/student/capstone/${capstoneCourse.id}/stage/1`)
                    }
                />

                <StageItem
                    title="Stage 2 – Backlog Planning"
                    unlocked={!isLocked(2)}
                    completed={capstoneStage > 2}
                    meeting={meeting}
                    onClick={() =>
                        !isLocked(2) &&
                        router.push(`/student/capstone/${capstoneCourse.id}/stage/2`)
                    }
                />

                <StageItem
                    title="Stage 2 – Development & Submission"
                    unlocked={!isLocked(3)}
                    completed={stage3Submitted}
                    meeting={meeting}
                    onClick={() =>
                        !isLocked(3) &&
                        router.push(`/student/capstone/${capstoneCourse.id}/stage/3`)
                    }
                />
            </div>
        </div>
    )
}
