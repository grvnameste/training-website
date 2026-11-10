//app/teacher/capstone/approvals/page.tsx
'use client'
import { useState } from 'react'
import { CapstoneMeetingModal } from '@/components/teacher/CapstoneMeetingModal'
import { useCapstoneApprovals, ApprovalItem } from '@/hooks/useCapstoneApprovals'
import { ApprovalTable } from '@/components/teacher/ApprovalTable'

export default function CapstoneApprovalsPage() {
  const { items, loading, load, approve } = useCapstoneApprovals()
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)

  const openMeetingModal = (item: ApprovalItem) => {
    setSelectedItem(item)
    setIsMeetingModalOpen(true)
  }

  if (loading) {
    return <div className="text-center py-10 font-medium text-slate-500">Loading pending approvals...</div>
  }

  if (!items.length) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-in fade-in duration-500">
        <div className="text-4xl mb-4">🎉</div>
        <p className="text-lg">No pending approvals! You're all caught up.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Capstone Approvals</h1>
        <p className="text-slate-500 text-xs mt-0.5">Review student submissions and schedule meetings.</p>
      </div>

      <ApprovalTable
        items={items}
        onApprove={approve}
        onOpenMeeting={openMeetingModal}
      />

      {selectedItem && (
        <CapstoneMeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => {
            setIsMeetingModalOpen(false)
            load() // Refresh to update Add/Edit button
          }}
          studentId={selectedItem.student_id}
          capstoneId={selectedItem.capstone_id}
          studentName={selectedItem.student_name}
          capstoneTitle={selectedItem.title}
        />
      )}
    </div>
  )
}
