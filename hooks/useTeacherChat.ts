//hooks/useTeacherChat.ts
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { useUser } from "@clerk/nextjs"

export interface Room {
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

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  created_at: string
}

export function useTeacherChat() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [teacherName, setTeacherName] = useState('Teacher')
  const { user } = useUser()

  useEffect(() => {
    const init = async () => {
      if (!user) {
        setLoading(false)
        return
      }
    


      console.log("USER:", user?.id)

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id, name, clerk_id') // ✅ FIXED
    .eq('clerk_id', user.id)
  .maybeSingle() // 🔥 IMPORTANT

console.log("PROFILE:", profile)
console.log("PROFILE ERROR:", profileError)
    
      if (!profile) {
        setLoading(false)
        return
      }
    
      const teacherUUID = profile.id
      console.log("TEACHER UUID:", teacherUUID)

      
      setTeacherId(teacherUUID)
      setTeacherName(profile.name || 'Teacher')    
      const { data: chatRooms, error } = await supabase
  .from('chat_rooms')
  .select('*, course:courses(title)')
  .eq('teacher_id', teacherUUID) // 🔥 ADD THIS LINE
    
    console.log("CHAT ROOMS:", chatRooms)
    console.log("CHAT ROOMS ERROR:", error)
    
      if (chatRooms) {
        const enrichedRooms = await Promise.all(
          chatRooms.map(async (room: any) => {
            const { data: studentProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', room.student_id)
              .maybeSingle()
    
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id)
              .eq('is_read', false)
              .neq('sender_id', teacherUUID)
    
            return {
              ...room,
              student_name:
                studentProfile?.full_name ||
                studentProfile?.name ||
                'Student',
              student_image:
                studentProfile?.avatar ||
                studentProfile?.avatar_url ||
                studentProfile?.image,
              course_title: room.course?.title,
              unread_count: count || 0,
            }
          })
        )
    
        setRooms(enrichedRooms)

        // 🔥 ADD THIS LINE
        if (enrichedRooms.length > 0) {
          setSelectedRoom(enrichedRooms[0])
        }
            }
    
      setLoading(false)
    }
    init()
  }, [user])

  // Global Unread Tracker
  useEffect(() => {
    if (!teacherId || rooms.length === 0) return
    const channel = supabase
      .channel('global-unread-tracker')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
        (payload) => {
          const newMessage = payload.new as Message
          if (newMessage.sender_id !== teacherId && selectedRoom?.id !== newMessage.room_id) {
            setRooms(prev => prev.map(r => r.id === newMessage.room_id ? { ...r, unread_count: (r.unread_count || 0) + 1 } : r))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [teacherId, rooms.length, selectedRoom])
  // Room Specific Logic
  useEffect(() => {
    if (!selectedRoom || !teacherId) return
    const loadMessages = async () => {
      setMessages([]) // 🔥 ADD THIS LINE
    
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: true })
    
      setMessages(data || [])
    }

    const markMessagesAsRead = async () => {
      if (!teacherId) return
      const res = await fetch('/api/chat/mark-read', {
        method: 'POST',
        body: JSON.stringify({ roomId: selectedRoom.id, userId: teacherId })
      })
      if (res.ok) {
        setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, unread_count: 0 } : r))
      }
    }

    loadMessages()
    markMessagesAsRead()

    const channel = supabase
      .channel(`room:${selectedRoom.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${selectedRoom.id}` }, 
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
                    if (newMessage.sender_id !== teacherId) markMessagesAsRead()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedRoom, teacherId])
  return {
    rooms,
    setRooms,
    selectedRoom,
    setSelectedRoom,
    messages,
    loading,
    teacherId,
    teacherName
  }
}
