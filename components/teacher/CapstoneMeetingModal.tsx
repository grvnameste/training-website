'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Video, Calendar, Clock, Loader2 } from 'lucide-react'

interface CapstoneMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: string
  capstoneId: string
  studentName: string
  capstoneTitle: string
}

export function CapstoneMeetingModal({
  isOpen,
  onClose,
  studentId,
  capstoneId,
  studentName,
  capstoneTitle
}: CapstoneMeetingModalProps) {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [meetingLink, setMeetingLink] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<{ link?: string; date?: string; time?: string }>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({
    type: null,
    message: null
  })

  useEffect(() => {
    if (isOpen && studentId && capstoneId) {
      fetchExistingMeeting()
    } else {
      resetForm()
      setErrors({})
      setStatus({ type: null, message: null })
    }
  }, [isOpen, studentId, capstoneId])

  const fetchExistingMeeting = async () => {
    try {
      setFetching(true)
      const res = await fetch(`/api/capstone/meeting?capstoneId=${capstoneId}&studentId=${studentId}`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setMeetingLink(data.meeting_link || '')
          setMeetingDate(data.meeting_date || '')
          setMeetingTime(data.meeting_time || '')
          setNotes(data.notes || '')
        }
      }
    } catch (err) {
      console.error('Failed to fetch meeting:', err)
    } finally {
      setFetching(false)
    }
  }

  const resetForm = () => {
    setMeetingLink('')
    setMeetingDate('')
    setMeetingTime('')
    setNotes('')
  }

  const handleSave = async () => {
    // Reset states
    setErrors({})
    setStatus({ type: null, message: null })

    const newErrors: typeof errors = {}
    if (!meetingLink) newErrors.link = 'Google Meet link is required'
    if (!meetingDate) newErrors.date = 'Date is required'
    if (!meetingTime) newErrors.time = 'Time is required'

    if (meetingLink && !meetingLink.startsWith('http')) {
      newErrors.link = 'Enter a valid URL (http/https)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }


    try {
      setLoading(true)
      const res = await fetch('/api/capstone/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          capstoneId,
          meetingLink,
          meetingDate,
          meetingTime,
          notes
        })
      })

      if (res.ok) {
        setStatus({ type: 'success', message: 'Meeting scheduled successfully! ✅' })
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        const err = await res.json()
        setStatus({ type: 'error', message: err.error || 'Failed to save meeting' })
      }
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'An error occurred while saving' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            {(meetingLink && !errors.link && !fetching) ? 'Edit Meeting' : 'Schedule Meeting'}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Schedule a Google Meet session with <strong>{studentName}</strong> for <strong>{capstoneTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* Status Message */}
            {status.message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {status.message}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="link" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <Video className="w-4 h-4" />
                Google Meet Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="link"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className={`rounded-xl border-slate-200 focus:ring-blue-500 ${errors.link ? 'border-red-500 bg-red-50' : ''}`}
              />
              {errors.link && <p className="text-[11px] text-red-500 ml-1">{errors.link}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4" />
                  Meeting Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className={`rounded-xl border-slate-200 focus:ring-blue-500 ${errors.date ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.date && <p className="text-[11px] text-red-500 ml-1">{errors.date}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4" />
                  Meeting Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className={`rounded-xl border-slate-200 focus:ring-blue-500 ${errors.time ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.time && <p className="text-[11px] text-red-500 ml-1">{errors.time}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Briefly explain the purpose of this meeting..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl border-slate-200 focus:ring-blue-500 min-h-[100px]"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || status.type === 'success'}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {meetingLink && !errors.link ? 'Update Meeting' : 'Schedule Meeting'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
