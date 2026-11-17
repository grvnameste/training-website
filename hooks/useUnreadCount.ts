//hooks/useUnreadCount.ts
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'

export const useUnreadCount = (userId: string | null, courseId: string | null) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [roomId, setRoomId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !courseId) return

    const fetchRoomAndCount = async () => {
      // 1. Get room ID
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('student_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()

      if (room) {
        setRoomId(room.id)
        
        // 2. Fetch initial unread count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .eq('is_read', false)
          .neq('sender_id', userId)
        
        setUnreadCount(count || 0)
      }
    }

    fetchRoomAndCount()
  }, [userId, courseId])

  useEffect(() => {
    if (!roomId || !userId) return

    const fetchCount = async () => {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .eq('is_read', false)
        .neq('sender_id', userId)
      
      setUnreadCount(count || 0)
    }

    // 1. Subscribe to changes
    const channel = supabase
      .channel(`unread-count:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}` // Server-side filter is better
        },
        () => {
          console.log('Unread count changed via realtime')
          fetchCount()
        }
      )
      .subscribe()

    // 2. Poll as fallback (every 10 seconds)
    const interval = setInterval(fetchCount, 10000)

    // 3. Re-fetch on window focus
    window.addEventListener('focus', fetchCount)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
      window.removeEventListener('focus', fetchCount)
    }
  }, [roomId, userId])

  return unreadCount
}
