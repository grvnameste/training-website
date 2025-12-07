// app/student/profile/page.tsx
'use client'

import React, { useEffect, useState, ChangeEvent, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit3, Save, Camera, Eye, EyeOff, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface Project {
  id: string
  title: string
  description?: string
  thumbnail?: string
  url?: string
}

export interface ProfileSection {
  id: string
  title: string
  visible: boolean
}

export interface UserProfile {
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  about?: string
  projects?: Project[]
  sections?: ProfileSection[]
}

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

const createId = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`

const fallbackProjects: Project[] = [
  {
    id: 'p1',
    title: 'Project 1 – Smart Course Dashboard',
    description: 'Built a responsive dashboard to track course progress and goals.',
    thumbnail: '/images/g1.png',
    url: '',
  },
  {
    id: 'p2',
    title: 'Project 2 – AI-Powered Quiz Generator',
    description: 'Generates adaptive quizzes based on learner performance.',
    thumbnail: '/images/g2.png',
    url: '',
  },
]

const fallbackSections: ProfileSection[] = [
  { id: 's1', title: 'Overview', visible: true },
  { id: 's2', title: 'About', visible: true },
  { id: 's3', title: 'Project gallery', visible: true },
  { id: 's4', title: 'Skills', visible: true },
]

export default function StudentProfilePage() {
  const fallback: UserProfile = {
    name: 'Alex Doe',
    email: 'student@example.com',
    phone: '',
    avatar: undefined,
    role: 'Learner',
    about:
      'Passionate developer with a focus on creating intuitive user experiences.',
    projects: fallbackProjects,
    sections: fallbackSections,
  }

  const [user, setUser] = useState<UserProfile>(fallback)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
  )
  const [fileBusy, setFileBusy] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const stored = safeParse(localStorage.getItem('lms_current_user'))
    if (stored) {
      setUser((s) => ({
        ...s,
        ...stored,
        projects: stored.projects || s.projects || fallbackProjects,
        sections: stored.sections || s.sections || fallbackSections,
      }))
    }
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

  const onFileImmediate = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileBusy(true)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      const updated: UserProfile = { ...user, avatar: dataUrl }
      try {
        const current =
          safeParse(localStorage.getItem('lms_current_user')) || {}
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
      const current =
        safeParse(localStorage.getItem('lms_current_user')) || {}
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

  // ---- Project handlers ----
  const handleProjectChange = (
    id: string,
    field: keyof Project,
    value: string
  ) => {
    setUser((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }))
  }

  const handleAddProject = () => {
    const newProject: Project = {
      id: createId(),
      title: 'New project',
      description: '',
      thumbnail: '',
      url: '',
    }
    setUser((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProject],
    }))
  }

  const handleDeleteProject = (id: string) => {
    setUser((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== id),
    }))
  }

  // ---- Section handlers ----
  const handleToggleSectionVisibility = (id: string) => {
    setUser((prev) => ({
      ...prev,
      sections: (prev.sections || fallbackSections).map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
    }))
  }

  const handleAddSection = () => {
    const title =
      window.prompt('Section name (e.g. Certifications, Achievements):') ||
      'Custom section'
    const newSection: ProfileSection = {
      id: createId(),
      title,
      visible: true,
    }
    setUser((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }))
  }

  const handleDeleteSection = (id: string) => {
    setUser((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((s) => s.id !== id),
    }))
  }

  const projects = user.projects || []
  const sections = user.sections || fallbackSections

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Top banner – similar to Coursera page header spacing */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-gray-900">
            Learner Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information and showcase your learning journey.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left column: main profile card */}
          <div className="flex-1 space-y-5">
            {/* Main profile header card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center ring-1 ring-gray-200 cursor-pointer"
                        onClick={() => {
                          if (!editing) triggerAvatarPicker()
                        }}
                        aria-label="Change profile image"
                      >
                        {editing ? (
                          avatarPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarPreview}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-gray-500">
                              No image
                            </div>
                          )
                        ) : user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-gray-500">No image</div>
                        )}

                        {!editing && (
                          <div className="absolute bottom-1 right-1 bg-white/95 p-1 rounded-full shadow-sm border border-gray-200">
                            <Camera className="w-3.5 h-3.5 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {editing && (
                        <button
                          type="button"
                          onClick={triggerAvatarPicker}
                          className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-800"
                        >
                          Change photo
                        </button>
                      )}
                    </div>

                    {/* Name + meta */}
                    <div className="space-y-1">
                      {editing ? (
                        <div className="space-y-2">
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-xl font-semibold h-10"
                          />
                          <div className="text-xs text-gray-500">
                            {user.role || 'Learner'}
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-2xl font-semibold text-gray-900">
                            {user.name}
                          </h2>
                          <div className="text-sm text-gray-500">
                            {user.role || 'Learner'}
                          </div>
                          <div className="mt-2 text-sm text-blue-700">
                            Capstone project:&nbsp;
                            <span className="font-medium">
                              AI-Powered Learning Assistant
                            </span>
                          </div>
                        </>
                      )}

                      {/* Contact info */}
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <div>{user.email}</div>
                        {editing ? (
                          <Input
                            placeholder="Phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 h-9 max-w-xs"
                          />
                        ) : user.phone ? (
                          <div>{user.phone}</div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {editing ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={cancelEdit}
                          className="px-4 h-9 text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={fileBusy}
                          className="px-4 h-9 text-sm bg-[#0056D2] hover:bg-[#0042a8] text-white"
                        >
                          <Save className="w-4 h-4 mr-1.5" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={startEdit}
                        className="px-4 h-9 text-sm border-gray-300"
                      >
                        <Edit3 className="w-4 h-4 mr-1.5" />
                        Edit profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content sections card – Coursera-style white panel */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Profile details
                  </CardTitle>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      Saved locally
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-6">
                {/* About */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    About
                  </h3>
                  {editing ? (
                    <textarea
                      className="w-full rounded-md border border-gray-300 p-3 min-h-[90px] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0056D2]"
                      value={user.about}
                      onChange={(e) =>
                        setUser((p) => ({ ...p, about: e.target.value }))
                      }
                      placeholder="Write a short summary about your background, interests or learning goals."
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {user.about}
                    </p>
                  )}
                </section>

                <div className="border-t border-gray-100" />

                {/* Project Gallery – NOW DYNAMIC & EDITABLE */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Project gallery
                    </h3>
                    {editing ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs border-dashed border-gray-300"
                        onClick={handleAddProject}
                      >
                        + Add project
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Showcase key work or course projects
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-4">
                      {projects.length === 0 && (
                        <p className="text-xs text-gray-500">
                          No projects yet. Click &quot;Add project&quot; to
                          create one.
                        </p>
                      )}
                      {projects.map((project, idx) => (
                        <div
                          key={project.id}
                          className="rounded-md border border-gray-200 bg-gray-50/60 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-gray-700">
                              Project {idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-[11px] text-red-500 flex items-center gap-1 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                          <Input
                            className="h-8 text-xs"
                            placeholder="Project title"
                            value={project.title}
                            onChange={(e) =>
                              handleProjectChange(
                                project.id,
                                'title',
                                e.target.value
                              )
                            }
                          />
                          <textarea
                            className="w-full rounded-md border border-gray-300 p-2 text-xs min-h-[60px]"
                            placeholder="Short description"
                            value={project.description || ''}
                            onChange={(e) =>
                              handleProjectChange(
                                project.id,
                                'description',
                                e.target.value
                              )
                            }
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              className="h-8 text-xs"
                              placeholder="Thumbnail URL (optional)"
                              value={project.thumbnail || ''}
                              onChange={(e) =>
                                handleProjectChange(
                                  project.id,
                                  'thumbnail',
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              className="h-8 text-xs"
                              placeholder="Project link (GitHub / live)"
                              value={project.url || ''}
                              onChange={(e) =>
                                handleProjectChange(
                                  project.id,
                                  'url',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded-md overflow-hidden bg-white border border-gray-200 shadow-sm"
                        >
                          {project.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              className="w-full h-32 object-cover"
                            />
                          )}
                          <div className="p-3 space-y-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {project.title}
                            </div>
                            {project.description && (
                              <p className="text-xs text-gray-600 line-clamp-3">
                                {project.description}
                              </p>
                            )}
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-1 text-xs font-medium text-blue-700 hover:underline"
                              >
                                View project
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <p className="text-xs text-gray-500">
                          No projects added yet.
                        </p>
                      )}
                    </div>
                  )}
                </section>

                <div className="border-t border-gray-100" />

                {/* Skills */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Skills & technologies
                  </h3>
                  <p className="text-xs text-gray-500">
                    Skills may appear on your profile and can be linked to
                    courses or projects.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'React', 'TensorFlow', 'Node.js', 'Figma'].map(
                      (s) => (
                        <span
                          key={s}
                          className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
                        >
                          {s}
                        </span>
                      )
                    )}
                  </div>
                </section>

                {/* bottom actions */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => {
                      const dataStr =
                        'data:text/json;charset=utf-8,' +
                        encodeURIComponent(JSON.stringify(user, null, 2))
                      const a = document.createElement('a')
                      a.href = dataStr
                      a.download = `${(user.name || 'profile')
                        .replace(/\s+/g, '_')
                        .toLowerCase()}_profile.json`
                      a.click()
                    }}
                    className="px-4 h-9 text-sm bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 mr-2 inline" /> Export JSON
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={resetProfile}
                    className="px-4 h-9 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    Reset profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: sidebar – Coursera-like utilities */}
          <aside className="w-full lg:w-80 space-y-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2">
                  {sections.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <div className="text-xs font-medium text-gray-800">
                          {s.title}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {editing && (
                          <button
                            type="button"
                            className="text-[11px] text-gray-500 hover:text-gray-700"
                            onClick={() =>
                              handleToggleSectionVisibility(s.id)
                            }
                          >
                            {s.visible ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {s.visible ? 'Visible' : 'Hidden'}
                        </span>
                        {editing && (
                          <button
                            type="button"
                            className="text-[11px] text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteSection(s.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs border-dashed border-gray-300"
                  onClick={handleAddSection}
                  disabled={!editing}
                >
                  + Add custom section
                </Button>
                {!editing && (
                  <p className="text-[11px] text-gray-500">
                    Click &quot;Edit profile&quot; to manage sections (show /
                    hide / delete).
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Export & share
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-500">
                  Changes are stored in your browser. Export your profile to
                  share externally.
                </div>
                <Button className="w-full h-9 text-xs bg-[#fff5e6] text-[#8a5a00] border border-[#ffd9a6] hover:bg-[#ffe8c2]">
                  Export to PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs border-gray-300"
                >
                  Share to LinkedIn
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-9 text-xs text-gray-600"
                >
                  Push to GitHub
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* hidden immediate avatar input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={onFileImmediate}
        className="hidden"
      />
    </div>
  )
}
