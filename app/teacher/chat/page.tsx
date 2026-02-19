'use client'

import { useEffect, useState, useRef } from 'react'
import supabase from '@/lib/supabase/client'
import { 
  Search, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Loader2,
  ChevronRight,
  User,
  Book,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { usePresence } from '@/hooks/usePresence'

interface Room {
  id: string
  student_id: string
  course_id: string
  student_name?: string
  student_image?: string
  course_title?: string
  last_message?: string
  last_message_at?: string
  unread_count?: number
}

interface Message {
  id: string
  sender_id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  created_at: string
}

export default function TeacherChatPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [teacherName, setTeacherName] = useState('Teacher')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🛰️ Track Presence
  const { isUserOnline } = usePresence(teacherId, teacherName)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setTeacherId(user.id)

      // Fetch teacher name
      const { data: profile } = await supabase.from('profiles').select('full_name, name').eq('id', user.id).maybeSingle()
      if (profile) setTeacherName(profile.full_name || profile.name || 'Teacher')

      // 1. Fetch Chat Rooms with profiles and courses info
      // NOTE: In a real app, you might need extra joins or RPC to get student names properly
      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('teacher_id', user.id)

      if (chatRooms) {
        // Fetch student profiles for each room
        const enrichedRooms = await Promise.all(chatRooms.map(async (room: any) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', room.student_id)
            .maybeSingle()

          const studentName = profile?.full_name || 
                             profile?.name || 
                             (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : null) || 
                             'Student'

          return {
            ...room,
            student_name: studentName,
            student_image: profile?.avatar || profile?.avatar_url || profile?.image,
            course_title: room.course?.title,
            unread_count: 0 // Will fetch below
          }
        }))

        // Fetch unread counts for each room
        const roomsWithUnread = await Promise.all(enrichedRooms.map(async (room) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_read', false)
            .neq('sender_id', user.id)
          
          return { ...room, unread_count: count || 0 }
        }))

        setRooms(roomsWithUnread)
      }
      setLoading(false)
    }
    init()
  }, [])

  // 🔔 Global Unread Tracker (Listen for ALL new messages for the teacher's rooms)
  useEffect(() => {
    if (!teacherId || rooms.length === 0) return

    const channel = supabase
      .channel('global-unread-tracker')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMessage = payload.new as Message
          // Check if this message belongs to any room the teacher is in
          const roomToUpdate = rooms.find(r => r.id === newMessage.room_id)
          
          if (roomToUpdate && newMessage.sender_id !== teacherId) {
            // If the room is NOT currently selected, increment its unread count
            if (selectedRoom?.id !== newMessage.room_id) {
              setRooms(prev => prev.map(r => 
                r.id === newMessage.room_id 
                  ? { ...r, unread_count: (r.unread_count || 0) + 1 } 
                  : r
              ))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teacherId, rooms, selectedRoom])

  // 💬 Load Messages for Selected Room
  useEffect(() => {
    if (!selectedRoom) return

    const loadMessages = async () => {
      setMsgLoading(true)
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: true })
      
      setMessages(data || [])
      setMsgLoading(false)
      scrollToBottom()
    }

    const markMessagesAsRead = async () => {
      if (!selectedRoom || !teacherId) return
      
      console.log('Teacher API call: Marking messages as read for room:', selectedRoom.id)
      try {
        const res = await fetch('/api/chat/mark-read', {
          method: 'POST',
          body: JSON.stringify({ roomId: selectedRoom.id, userId: teacherId })
        })
        
        if (res.ok) {
          console.log('Teacher successfully marked all messages as read via API')
          // Update local state for unread count
          setRooms(prev => prev.map(r => 
            r.id === selectedRoom.id ? { ...r, unread_count: 0 } : r
          ))
        } else {
          console.error('Teacher API failed to mark as read')
        }
      } catch (err) {
        console.error('Teacher Fetch error marking as read:', err)
      }
    }

    loadMessages()
    markMessagesAsRead()

    // Realtime subscription
    const channel = supabase
      .channel(`room:${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
          
          // If this room is currently selected, mark the new message as read if it's from the student
          if (newMessage.sender_id !== teacherId) {
            markMessagesAsRead()
          }
          
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight
        }
      }
    }, 100)
  }

  const handleSendMessage = async () => {
    if ((!content.trim() && !selectedFile) || !selectedRoom || !teacherId) return

    setIsUploading(true)
    let mediaUrl = null
    let mediaType = null

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `chat/${selectedRoom.id}/${fileName}`

        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('filePath', filePath)

        const res = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Upload failed')
        }

        const { publicUrl } = await res.json()
        mediaUrl = publicUrl
        mediaType = selectedFile.type.startsWith('image') ? 'image' : 'video'
      }

      const { error: sendError } = await supabase.from('chat_messages').insert({
        room_id: selectedRoom.id,
        sender_id: teacherId,
        content: content.trim() || null,
        media_url: mediaUrl,
        media_type: mediaType,
      })

      if (sendError) throw sendError

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

    // Limit to 50MB
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      alert('File is too large! Maximum limit is 50MB.')
      e.target.value = ''
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFilePreview(reader.result as string)
    }
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
      {/* 👥 Conversation List Sidebar */}
      <div className="w-80 border-r flex flex-col bg-slate-50/50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Inbox
            <span className="flex items-center gap-1.5 ml-auto">
              <span className={`w-2 h-2 rounded-full ${(teacherId && isUserOnline(teacherId)) ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Live Status</span>
            </span>
          </h2>
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-9 bg-slate-50" 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {rooms.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">No conversations yet.</p>
              </div>
            ) : (
              rooms
                .filter(room => 
                  room.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  room.course_title?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${
                    selectedRoom?.id === room.id 
                    ? 'bg-blue-600 text-white shadow-lg active:scale-95' 
                    : 'hover:bg-blue-50 text-slate-600 active:scale-98'
                  }`}
                >
                  <div className="relative">
                    <Avatar className={`w-12 h-12 border-2 transition-transform duration-300 ${selectedRoom?.id === room.id ? 'border-white/50 scale-105' : 'border-white'}`}>
                      <AvatarImage src={room.student_image} className="object-cover" />
                      <AvatarFallback className={selectedRoom?.id === room.id ? 'bg-white/20' : 'bg-slate-200'}>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    {isUserOnline(room.student_id, room.course_id) && (
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full ${selectedRoom?.id === room.id ? 'border-blue-600' : ''}`} />
                    )}
                    {room.unread_count !== undefined && room.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm animate-in zoom-in duration-300">
                        {room.unread_count}
                      </div>
                    )}
                  </div>
                    <div className="flex-1 text-left overflow-hidden">
                    <p className={`font-extrabold text-sm truncate ${selectedRoom?.id === room.id ? 'text-white' : 'text-slate-900'}`}>
                      {room.student_name}
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 opacity-80 font-medium truncate mt-0.5`}>
                      <Book className="w-3.5 h-3.5" />
                      {room.course_title}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-50 ${selectedRoom?.id === room.id ? 'hidden' : 'block'}`} />
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 💬 Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border shadow-sm">
                    <AvatarImage src={selectedRoom.student_image} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  {isUserOnline(selectedRoom.student_id, selectedRoom.course_id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {selectedRoom.student_name}
                    {isUserOnline(selectedRoom.student_id, selectedRoom.course_id) && (
                      <span className="text-[10px] text-green-600 font-bold animate-pulse uppercase tracking-wider">Online</span>
                    )}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] font-medium bg-primary/5 text-primary hover:bg-primary/5 border-none px-2">
                    {selectedRoom.course_title}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages Area - Modern Bubble Style */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full bg-[#f8faff]" ref={scrollRef}>
                <div className="p-6 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === teacherId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 shadow-sm transition-all hover:shadow-md ${
                          msg.sender_id === teacherId
                            ? 'bg-blue-600 text-white rounded-[22px] rounded-br-none font-medium'
                            : 'bg-white text-slate-800 rounded-[22px] rounded-bl-none border border-slate-100'
                        }`}
                      >
                        {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                        
                        {msg.media_url && (
                          <div className={`mt-2 rounded-2xl overflow-hidden border ${msg.sender_id === teacherId ? 'border-white/20' : 'border-slate-100'}`}>
                            {msg.media_type === 'image' ? (
                              <img
                                src={msg.media_url}
                                alt="Attachment"
                                className="max-w-full h-auto object-cover max-h-80"
                              />
                            ) : (
                              <video
                                src={msg.media_url}
                                controls
                                className="max-w-full h-auto max-h-80"
                              />
                            )}
                          </div>
                        )}
                        
                        <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${
                          msg.sender_id === teacherId ? 'text-blue-100/70 text-right' : 'text-slate-400 text-left'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4 pt-1 border-t bg-white shrink-0">
              {/* 🖼️ File Preview - Compact */}
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
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 left-[138px] h-6 w-6 rounded-full shadow-lg border-2 border-white transition-transform duration-200"
                    onClick={() => {
                      setSelectedFile(null)
                      setFilePreview(null)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-blue-300 transition-all">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                  className="border-none bg-transparent focus-visible:ring-0 shadow-none text-sm placeholder:text-slate-400"
                  disabled={isUploading}
                />

                <Button 
                  size="icon"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm h-9 w-9 transition-transform active:scale-95 disabled:opacity-50"
                  onClick={handleSendMessage}
                  disabled={isUploading || (!content.trim() && !selectedFile)}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                title="Upload media"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/20">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600">Your Inbox</h3>
            <p className="text-sm max-w-xs text-center mt-2">
              Select a student from the sidebar to start discussing their progress.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
