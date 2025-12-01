'use client'

import React, { useEffect, useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

export interface UserProfile {
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
}

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export default function EditProfile({
  initial,
  onClose,
  onSave,
}: {
  initial: UserProfile
  onClose: () => void
  onSave: (u: UserProfile) => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [phone, setPhone] = useState(initial?.phone || '')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(initial?.avatar)
  const [fileBusy, setFileBusy] = useState(false)

  useEffect(() => {
    setName(initial?.name || '')
    setPhone(initial?.phone || '')
    setAvatarPreview(initial?.avatar)
  }, [initial])

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileBusy(true)
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(String(reader.result))
      setFileBusy(false)
    }
    reader.onerror = () => setFileBusy(false)
    reader.readAsDataURL(f)
  }

  const handleSave = () => {
    const updated: UserProfile = {
      ...initial,
      name: name.trim() || initial.name,
      phone: phone.trim(),
      avatar: avatarPreview,
    }

    try {
      const current = safeParse(localStorage.getItem('lms_current_user')) || {}
      const merged = { ...current, ...updated }
      localStorage.setItem('lms_current_user', JSON.stringify(merged))
    } catch (e) {}

    onSave(updated)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <Card className="relative w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Profile</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">Update name, phone and profile image (email read-only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-sm text-foreground/60">No image</div>
              )}
            </div>
            <div>
              <label className="text-xs text-foreground/70 block mb-1">Profile Image</label>
              <input type="file" accept="image/*" onChange={onFile} />
            </div>
          </div>

          <div>
            <label className="text-xs text-foreground/70">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-foreground/70">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-foreground/70">Email (read-only)</label>
            <Input value={initial?.email || ''} readOnly />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white" disabled={fileBusy}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
