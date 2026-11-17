import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'

export interface Room {
  id: string
  student_id: string
  teacher_id: string
  course_id: string
  student_name?: string
  student_image?: string | null
  course_title?: string
  last_message?: string | null
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
  const [teacherName, setTeacherName] = useState('Instructor')
  const { user } = useUser()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setTeacherId(user.id)
    setTeacherName(user.name || 'Instructor')

    let active = true
    fetch('/api/chat/rooms', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Could not load conversations')
        if (!active) return
        const nextRooms: Room[] = data.rooms ?? []
        setRooms(nextRooms)
        setSelectedRoom((current) => current ?? nextRooms[0] ?? null)
      })
      .catch((error) => console.error('Chat rooms load failed:', error))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!selectedRoom) {
      setMessages([])
      return
    }

    let active = true
    const load = async () => {
      try {
        const res = await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`, {
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Could not load messages')
        if (active) {
          setMessages(data.messages ?? [])
          setRooms((prev) =>
            prev.map((room) =>
              room.id === selectedRoom.id ? { ...room, unread_count: 0 } : room
            )
          )
        }
      } catch (error) {
        console.error('Messages load failed:', error)
      }
    }

    void load()
    const interval = setInterval(load, 5000)
    window.addEventListener('focus', load)

    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('focus', load)
    }
  }, [selectedRoom])

  return {
    rooms,
    setRooms,
    selectedRoom,
    setSelectedRoom,
    messages,
    setMessages,
    loading,
    teacherId,
    teacherName,
  }
}
