//components/teacher/ApprovalTable.tsx
import { Button } from '@/components/ui/button'
import { Video } from 'lucide-react'
import { ApprovalItem } from '@/hooks/useCapstoneApprovals'

interface ApprovalTableProps {
    items: ApprovalItem[]
    onApprove: (item: ApprovalItem) => void
    onOpenMeeting: (item: ApprovalItem) => void
}

export function ApprovalTable({ items, onApprove, onOpenMeeting }: ApprovalTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 text-left">
                    <tr>
                        <th className="px-3 py-1.5 border">Capstone</th>
                        <th className="px-3 py-1.5 border">Student</th>
                        <th className="px-3 py-1.5 border">Stage</th>
                        <th className="px-3 py-1.5 border">Details</th>
                        <th className="px-3 py-1.5 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.progress_id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 border font-medium">{item.title}</td>
                            <td className="px-3 py-2 border">{item.student_name}</td>
                            <td className="px-3 py-2 border">Stage {item.current_stage}</td>
                            <td className="px-3 py-2 border">
                                {item.current_stage === 1 && item.requirement_url && (
                                    <a href={item.requirement_url} target="_blank" className="text-blue-600 underline">
                                        View Requirement
                                    </a>
                                )}
                           {item.current_stage === 2 && (
  <a
    href={`/teacher/board/${item.capstone_id}/${item.student_id}`}
    target="_blank"
    className="text-blue-600 underline"
  >
    View Board
  </a>
)}
                                {item.current_stage === 3 && item.stage3_files?.map(f => (
                                    <a key={f.id} href={f.file_url} target="_blank" className="block text-blue-600 underline">
                                        {f.file_name}
                                    </a>
                                ))}
                            </td>
                            <td className="px-3 py-2 border space-x-2">
                                <Button size="sm" onClick={() => onApprove(item)} className="bg-green-600 hover:bg-green-700 h-8 text-xs">
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onOpenMeeting(item)}
                                    className={`h-8 text-xs ${item.meeting
                                        ? "border-amber-600 text-amber-600 hover:bg-amber-50"
                                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                                        }`}
                                >
                                    <Video className="w-3 h-3 mr-1.5" />
                                    {item.meeting ? 'Edit Meeting' : 'Add Meeting'}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
