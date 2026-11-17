'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  ClipboardList,
  FolderKanban,
  Loader2,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type NotificationItem = {
  id: string
  type: string
  title: string
  body: string | null
  linkUrl: string | null
  readAt: string | null
  createdAt: string
}

function iconFor(type: string) {
  if (type.includes('overdue')) return AlertTriangle
  if (type.startsWith('assignment')) return ClipboardList
  if (type.startsWith('project')) return FolderKanban
  return Bell
}

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/me/notifications', { cache: 'no-store' })
      if (!res.ok) return
      const payload = await res.json().catch(() => ({}))
      setNotifications(payload.notifications ?? [])
      setUnreadCount(payload.unreadCount ?? 0)
    } catch {
      // Notification polling should never interrupt the page.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 60_000)
    return () => window.clearInterval(timer)
  }, [load])

  const markAllRead = async () => {
    setNotifications((items) =>
      items.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() }))
    )
    setUnreadCount(0)
    await fetch('/api/me/notifications', { method: 'PATCH' }).catch(() => undefined)
  }

  const openNotification = async (item: NotificationItem) => {
    if (!item.readAt) {
      setNotifications((items) =>
        items.map((entry) =>
          entry.id === item.id
            ? { ...entry, readAt: new Date().toISOString() }
            : entry
        )
      )
      setUnreadCount((count) => Math.max(0, count - 1))
      await fetch(`/api/me/notifications/${item.id}`, { method: 'PATCH' }).catch(
        () => undefined
      )
    }
    setOpen(false)
    if (item.linkUrl) router.push(item.linkUrl)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) void load()
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-400 hover:text-blue-600',
            className
          )}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <p className="text-[11px] text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => {
              const Icon = iconFor(item.type)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void openNotification(item)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50',
                    !item.readAt && 'bg-blue-50/50'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      item.type.includes('overdue')
                        ? 'bg-red-50 text-red-600'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-xs font-semibold text-slate-900">
                        {item.title}
                      </span>
                      {!item.readAt && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </span>
                    {item.body && (
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                        {item.body}
                      </span>
                    )}
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
