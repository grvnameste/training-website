//hooks/useStudentChat.ts
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  created_at: string
}

export function useStudentChat(
  isOpen: boolean,
  studentId: string,
  teacherId: string,
  courseId: string
) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('Student')

  // ✅ INIT CHAT (ROOM + MESSAGES)
  useEffect(() => {
    if (!isOpen || !studentId || !teacherId || !courseId) return
      const initChat = async () => {
      try {
        setLoading(true)

        console.log("🔥 HOOK INPUT:", { isOpen, studentId, teacherId, courseId })

        // get name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, name')
          .eq('id', studentId)
          .maybeSingle()

        if (profile) {
          setStudentName(profile.full_name || profile.name || 'Student')
        }

        // get room
        let { data: room } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('student_id', studentId)
          .eq('course_id', courseId)
          .maybeSingle()

        // create room if not exists
        if (!room) {
          const { data: newRoom, error } = await supabase
            .from('chat_rooms')
            .insert({
              student_id: studentId,
              teacher_id: teacherId,
              course_id: courseId
            })
            .select('id')
            .single()

          console.log("ROOM CREATE:", newRoom)
          console.log("ROOM ERROR:", error)

          if (error) return

          room = newRoom
        }

        if (room) {
          setRoomId(room.id)

          const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: true })

          setMessages(data || [])
        }

      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initChat()
  }, [isOpen, studentId, courseId, teacherId])

  // ✅ MARK READ
  useEffect(() => {
    if (!isOpen || !roomId || !studentId) return

    fetch('/api/chat/mark-read', {
      method: 'POST',
      body: JSON.stringify({ roomId, userId: studentId })
    })
  }, [isOpen, roomId, studentId])

  // ✅ REALTIME
  useEffect(() => {
    if (!isOpen || !roomId) return

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const newMessage = payload.new as Message

          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, roomId])

  return {
    messages,
    setMessages,
    loading,
    roomId,
    studentName
  }
}