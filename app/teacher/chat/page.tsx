//app/teacher/chat/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import supabase from '@/lib/supabase/client'
import { Loader2, MessageSquare, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { usePresence } from '@/hooks/usePresence'
import { useTeacherChat } from '@/hooks/useTeacherChat'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { MessageInput } from '@/components/chat/MessageInput'

export default function TeacherChatPage() {
  const {
    rooms,
    selectedRoom,
    setSelectedRoom,
    messages,
    loading,
    teacherId,
    teacherName
  } = useTeacherChat()

  const [content, setContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isUserOnline } = usePresence(teacherId, teacherName)




  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (viewport) viewport.scrollTop = viewport.scrollHeight
      }
    }, 100)
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const handleSendMessage = async () => {
    if ((!content.trim() && !selectedFile) || !selectedRoom || !teacherId) return

    setIsUploading(true)
    let mediaUrl = null
    let mediaType = null

    try {
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('filePath', `chat/${selectedRoom.id}/${Math.random()}.${selectedFile.name.split('.').pop()}`)

        const res = await fetch('/api/chat/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        const { publicUrl } = await res.json()
        mediaUrl = publicUrl
        mediaType = selectedFile.type.startsWith('image') ? 'image' : 'video'
      }

      await supabase.from('chat_messages').insert({
        room_id: selectedRoom.id,
        sender_id: teacherId,
        content: content.trim() || null,
        media_url: mediaUrl,
        media_type: mediaType,
      })

      setContent('')
      setSelectedFile(null)
      setFilePreview(null)
    } catch (error) {
      console.error('Send failed:', error)
      alert('Failed to send message.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) return alert('File is too large (max 50MB)')

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setFilePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-3xl border shadow-2xl overflow-hidden">
      <ChatSidebar
        rooms={rooms}
        selectedRoomId={selectedRoom?.id}
        onSelectRoom={setSelectedRoom}
        isUserOnline={isUserOnline}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        teacherId={teacherId}
      />

      <div className="flex-1 flex flex-col bg-white">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border shadow-sm">
                    <AvatarImage src={selectedRoom.student_image} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  {isUserOnline(selectedRoom.student_id, selectedRoom.course_id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {selectedRoom.student_name}
                    {isUserOnline(selectedRoom.student_id, selectedRoom.course_id) && (
                      <span className="text-[10px] text-green-600 font-bold uppercase">Online</span>
                    )}
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">{selectedRoom.course_title}</Badge>
                </div>
              </div>
            </div>

            <ChatMessages
              messages={messages}
              teacherId={teacherId}
              scrollRef={scrollRef}
            />

            <MessageInput
              content={content}
              onContentChange={setContent}
              onSend={handleSendMessage}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              isUploading={isUploading}
              filePreview={filePreview}
              onRemoveFile={() => { setSelectedFile(null); setFilePreview(null); }}
              selectedFileType={selectedFile?.type}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/20">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600">Your Inbox</h3>
            <p className="text-sm">Select a student to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  )
}
