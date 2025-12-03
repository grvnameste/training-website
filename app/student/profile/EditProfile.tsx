// app/student/profile/EditProfile.tsx
'use client'

import React, { useEffect, useState, ChangeEvent, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Edit3, Save, X, Camera } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface UserProfile {
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  about?: string
}

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export default function StudentProfilePage() {
  const fallback: UserProfile = {
    name: 'Alex Doe',
    email: 'student@example.com',
    phone: '',
    avatar: undefined,
    role: 'Student',
    about: 'Passionate developer with a focus on creating intuitive user experiences.',
  }

  const [user, setUser] = useState<UserProfile>(fallback)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [fileBusy, setFileBusy] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const skills = ['Python', 'React', 'TensorFlow', 'Node.js', 'Figma']
  const gallery = ['/images/g1.png', '/images/g2.png'] // replace with real images

  useEffect(() => {
    const stored = safeParse(localStorage.getItem('lms_current_user'))
    if (stored) setUser((s) => ({ ...s, ...stored }))
  }, [])

  const startEdit = () => {
    setName(user.name || '')
    setPhone(user.phone || '')
    setAvatarPreview(user.avatar)
    setEditing(true)
  }
  const cancelEdit = () => {
    setName('')
    setPhone('')
    setAvatarPreview(undefined)
    setFileBusy(false)
    setEditing(false)
  }

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
    if (e.target) e.target.value = ''
  }

  const onFileImmediate = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileBusy(true)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      const updated: UserProfile = { ...user, avatar: dataUrl }
      try {
        const current = safeParse(localStorage.getItem('lms_current_user')) || {}
        const merged = { ...current, ...updated }
        localStorage.setItem('lms_current_user', JSON.stringify(merged))
      } catch (err) {
        console.error(err)
      }
      setUser(updated)
      setFileBusy(false)
    }
    reader.onerror = () => setFileBusy(false)
    reader.readAsDataURL(f)
    if (e.target) e.target.value = ''
  }

  const triggerAvatarPicker = () => {
    if (fileBusy) return
    avatarInputRef.current?.click()
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      avatar: avatarPreview ?? user.avatar,
    }
    try {
      const current = safeParse(localStorage.getItem('lms_current_user')) || {}
      const merged = { ...current, ...updated }
      localStorage.setItem('lms_current_user', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
    }
    setUser(updated)
    setEditing(false)
  }

  const resetProfile = () => {
    if (!confirm('Reset profile to defaults?')) return
    localStorage.removeItem('lms_current_user')
    setUser(fallback)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Left column: big portfolio card */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-transparent">
            {/* Hero */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div
                  className="relative w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer ring-1 ring-gray-100"
                  onClick={() => { if (!editing) triggerAvatarPicker() }}
                  aria-label="Change profile image"
                >
                  {editing ? (
                    avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-foreground/60">No image</div>
                    )
                  ) : user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-sm text-foreground/60">No image</div>
                  )}

                  {/* small edit badge */}
                  {!editing && (
                    <div className="absolute bottom-2 right-2 bg-white/90 p-1 rounded-full shadow-sm">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  {editing ? (
                    <div className="space-y-2">
                      <Input value={name} onChange={(e) => setName(e.target.value)} className="text-2xl font-semibold" />
                      <div className="text-sm text-muted-foreground">{user.role}</div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold">{user.name}</h1>
                      <div className="text-sm text-blue-600 mt-1">Capstone Project: AI-Powered Learning Assistant</div>
                    </>
                  )}
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-3">
                {editing ? (
                  <>
                    <Button variant="ghost" onClick={cancelEdit} className="px-4 py-2">Cancel</Button>
                    <Button onClick={handleSave} disabled={fileBusy} className="px-4 py-2 bg-blue-600 text-white shadow">
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={startEdit} className="px-4 py-2 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Edit profile
                  </Button>
                )}
              </div>
            </div>

            {/* Dotted sections area */}
            <div className="mt-6 space-y-5">
              {/* About */}
              <section className="rounded-lg border border-dashed border-gray-200 p-5 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2">About Me</h3>
                {editing ? (
                  <textarea
                    className="w-full rounded-md border p-3 min-h-[80px]"
                    value={user.about}
                    onChange={(e) => setUser((p) => ({ ...p, about: e.target.value }))}
                    placeholder="Short bio / project headline"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{user.about}</p>
                )}
              </section>

              {/* Project Gallery */}
              <section className="rounded-lg border border-dashed border-gray-200 p-5 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Project Gallery</h3>
                <div className="grid grid-cols-2 gap-4">
                  {gallery.map((src, idx) => (
                    <div key={idx} className="h-44 rounded-lg overflow-hidden bg-gray-50 shadow-sm border">
                      <img src={src} alt={`project-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Skills */}
              <section className="rounded-lg border border-dashed border-gray-200 p-5 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-50"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              {/* bottom actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2))
                    const a = document.createElement('a')
                    a.href = dataStr
                    a.download = `${(user.name || 'profile').replace(/\s+/g, '_')}_profile.json`
                    a.click()
                  }}
                  className="px-4 py-2"
                >
                  <Save className="w-4 h-4 mr-2 inline" /> Export JSON
                </Button>
                <Button variant="ghost" onClick={resetProfile} className="px-4 py-2">Reset</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: sidebar */}
        <aside className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manage Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2">
                {['Hero', 'About Me', 'Project Gallery', 'Skills'].map((s) => (
                  <div key={s} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-200 rounded" />
                      <div className="text-sm">{s}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">👁️</div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">+ Add Custom Section</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">All changes saved locally</div>
              <Button className="w-full bg-amber-50 text-amber-700 border">Export to PDF</Button>
              <Button variant="outline" className="w-full">Share to linkedIn</Button>
              <Button variant="ghost" className="w-full">Push to GitHub</Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* hidden immediate avatar input */}
      <input ref={avatarInputRef} type="file" accept="image/*" onChange={onFileImmediate} className="hidden" />
    </div>
  )
}
