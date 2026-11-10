import { Video as VideoIcon } from 'lucide-react'

interface StageItemProps {
    title: string
    unlocked: boolean
    completed: boolean
    onClick: () => void
    meeting?: any
}

export function StageItem({
    title,
    unlocked,
    completed,
    onClick,
    meeting,
}: StageItemProps) {
    return (
        <div
            className={`group relative px-3 py-1.5 rounded-xl text-xs font-medium border
        flex justify-between items-center transition
        ${unlocked
                    ? 'bg-white hover:bg-blue-50 cursor-pointer border-blue-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'}
      `}
        >
            <span onClick={unlocked ? onClick : undefined} className="flex-1">{title}</span>

            <div className="flex items-center gap-3">
                {meeting && unlocked && (
                    <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all animate-pulse"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <VideoIcon className="w-4 h-4" />

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700 font-normal shadow-red-500/20">
                            <p className="font-bold border-b border-slate-700 pb-1 mb-1 flex items-center gap-1">
                                🗓️ Meeting Scheduled
                            </p>
                            <p>Date: {meeting.meeting_date}</p>
                            <p>Time: {meeting.meeting_time}</p>
                            {meeting.notes && <p className="mt-1 italic opacity-80">"{meeting.notes}"</p>}
                        </div>
                    </a>
                )}

                <div onClick={unlocked ? onClick : undefined}>
                    {completed ? (
                        <span className="text-green-600">✔</span>
                    ) : unlocked ? (
                        <span className="text-blue-500">→</span>
                    ) : (
                        <span>🔒</span>
                    )}
                </div>
            </div>
        </div>
    )
}
