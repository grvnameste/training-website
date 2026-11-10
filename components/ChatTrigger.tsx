//components/ChatTrigger.tsx
'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatTriggerProps {
  onClick: () => void
}

export function ChatTrigger({ onClick }: ChatTriggerProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all hover:scale-110 z-50"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  )
}
