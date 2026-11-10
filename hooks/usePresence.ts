import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'

export const usePresence = (userId: string | null, userName: string | null, courseId: string | null = null) => {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel('online-status', {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineUsers(state)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            user_name: userName || 'Anonymous',
            course_id: courseId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [userId, userName, courseId])

  const isUserOnline = (id: string, targetCourseId?: string | null) => {
    const userPresence = onlineUsers[id]
    if (!userPresence) return false
    
    if (targetCourseId) {
      // Check if any instance of this user is in the specific course
      return userPresence.some((p: any) => p.course_id === targetCourseId)
    }
    
    return true
  }

  return { onlineUsers, isUserOnline }
}
