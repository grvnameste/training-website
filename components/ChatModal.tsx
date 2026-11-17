//components/ChatModal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import supabase from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Loader2
} from 'lucide-react'

import { usePresence } from '@/hooks/usePresence'
import { useStudentChat, Message } from '@/hooks/useStudentChat'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: string
  teacherId: string
  courseId: string
  courseTitle: string
}

export function ChatModal({
  isOpen,
  onClose,
  studentId,
  teacherId,
  courseId,
  courseTitle
}: ChatModalProps) {
  const { messages, setMessages, loading, roomId, studentName } = useStudentChat(isOpen, studentId, teacherId, courseId)

  const [content, setContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🛰️ Track Presence
  const { isUserOnline } = usePresence(isOpen ? studentId : null, studentName, courseId)

  // 📜 Auto-scroll
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
    console.log("🚀 SEND CLICKED")
console.log("roomId:", roomId)
console.log("studentId:", studentId)
console.log("content:", content)
console.log("selectedFile:", selectedFile)
    if ((!content.trim() && !selectedFile) || !roomId) return

    const messageContent = content.trim()
    setIsUploading(true)
    let mediaUrl = null
    let mediaType = null

    try {
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('filePath', `chat/${roomId}/${Math.random()}.${selectedFile.name.split('.').pop()}`)

        const res = await fetch('/api/chat/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        const { publicUrl } = await res.json()
        mediaUrl = publicUrl
        mediaType = selectedFile.type.startsWith('image') ? 'image' : 'video'
      }

      const tempId = crypto.randomUUID()
      const optimisticMessage: Message = {
        id: tempId,
        room_id: roomId,
        sender_id: studentId,
        content: messageContent || null,
        media_url: mediaUrl,
        media_type: mediaType,
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, optimisticMessage])
      scrollToBottom()

      setContent('')
      setSelectedFile(null)
      setFilePreview(null)

      const { data: sentData, error: sendError } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: studentId,
        content: messageContent || null,
        media_url: mediaUrl,
        media_type: mediaType,
      }).select().single()

      if (sendError) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        throw sendError
      }

      if (sentData) {
        setMessages(prev => prev.map(m => m.id === tempId ? (sentData as Message) : m))
      }

    } catch (error: any) {
      console.error('Send failed:', error)
      alert(`Failed to send message: ${error.message || 'Unknown error'}`)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-slate-50 border-none shadow-2xl flex flex-col h-[650px] max-h-[90vh] rounded-3xl">
        <div className="bg-blue-600 px-4 py-2 flex items-center justify-between shadow-lg z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <DialogTitle className="text-white font-bold text-sm truncate max-w-[200px] uppercase tracking-wider flex items-center gap-2">
                Support Chat
                {isUserOnline(teacherId) && (
                  <span className="flex items-center gap-1 text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full animate-pulse uppercase">
                    Online
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-[10px] truncate max-w-[200px] font-medium opacity-80">
                {courseTitle}
              </DialogDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full bg-slate-50" ref={scrollRef}>
            <div className="p-3 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full py-20 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm">
                  Start a conversation with your instructor!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === studentId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-2 shadow-sm ${msg.sender_id === studentId ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/50'}`}>
                      {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                      {msg.media_url && (
                        <div className={`mt-0 rounded-xl overflow-hidden border ${msg.sender_id === studentId ? 'border-white/20' : 'border-slate-100'}`}>
                          {msg.media_type === 'image' ? (
                            <img src={msg.media_url} alt="Chat attachment" className="max-w-full h-auto object-cover max-h-60" />
                          ) : (
                            <video src={msg.media_url} controls className="max-w-full h-auto max-h-60" />
                          )}
                        </div>
                      )}
                      <span className={`text-[10px] mt-0 block font-medium uppercase tracking-tighter opacity-60 ${msg.sender_id === studentId ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="px-4 pb-4 pt-1 bg-white border-t shrink-0">
          {filePreview && (
            <div className="mb-2 relative group animate-in slide-in-from-bottom-2 duration-200">
              <div className="rounded-2xl overflow-hidden border-2 border-blue-100 shadow-sm bg-white max-w-[150px]">
                {selectedFile?.type.startsWith('image') ? (
                  <img src={filePreview} alt="Preview" className="w-full h-24 object-cover" />
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center bg-slate-50 italic text-slate-400 text-[10px] font-bold uppercase tracking-widest gap-1 p-2 text-center">
                    <Send className="w-4 h-4 text-blue-500 animate-pulse" />
                    Video
                  </div>
                )}
              </div>
              <Button size="icon" variant="destructive" className="absolute -top-2 left-[138px] h-6 w-6 rounded-full shadow-lg border-2 border-white transition-transform duration-200" onClick={() => { setSelectedFile(null); setFilePreview(null); }}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-blue-300 focus-within:shadow-sm transition-all">
            <Button variant="ghost" size="icon" className="shrink-0 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={selectedFile ? "Add a caption..." : "Type your message..."} className="border-none bg-transparent focus-visible:ring-0 shadow-none text-sm placeholder:text-slate-400" disabled={isUploading} />
            <Button size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm h-9 w-9 transition-transform active:scale-95 disabled:opacity-50" onClick={handleSendMessage} disabled={isUploading || (!content.trim() && !selectedFile)}>
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} title="Upload media" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
