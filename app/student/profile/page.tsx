'use client'

import React, { useEffect, useState, ChangeEvent, useRef } from 'react'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Github,
  Linkedin,
  Edit3,
  Save,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Undo2,
  Plus,
  User,
  Mail,
  ShieldCheck,
  FolderGit2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export interface Project {
  id: string
  title: string
  description?: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  role?: string
  about?: string
  avatar?: string
  projects?: Project[]
}

const createId = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`

const fallbackProjects: Project[] = [
  {
    id: 'p1',
    title: 'Smart Course & SDLC Workspace',
    description: 'Built a responsive dashboard to track course progress, capstone milestones, and engineering deliverables.',
  },
]

export default function StudentProfilePage() {
  const { user, isLoaded } = useUser()

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Student',
    about: '',
    avatar: undefined,
    projects: fallbackProjects,
  })

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [about, setAbout] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<{ firstName?: string }>({})
  const [recentlyDeletedProject, setRecentlyDeletedProject] = useState<{ project: Project; index: number } | null>(null)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      setLoadingProfile(false)
      return
    }

    const loadProfile = async () => {
      setLoadingProfile(true)
      try {
        const res = await fetch('/api/student/profile')
        if (res.ok) {
          const data = await res.json()
          const nameParts = (data.name || user.name || '').split(' ')
          const fName = data.first_name || nameParts[0] || ''
          const lName = data.last_name || nameParts.slice(1).join(' ') || ''

          setProfile({
            firstName: fName,
            lastName: lName,
            email: data.email || user.email || '',
            role: data.role || 'Student',
            about: data.about || '',
            avatar: data.avatar || user.avatarUrl,
            projects: Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : fallbackProjects,
          })
        } else {
          // Fallback to session data
          setProfile({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: 'Student',
            about: '',
            avatar: user.avatarUrl ?? undefined,
            projects: fallbackProjects,
          })
          toast.info('Loaded profile details from your sign-in account')
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err)
        toast.error('Could not load profile from server. Showing local session data.')
        setProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          role: 'Student',
          about: '',
          avatar: user.avatarUrl ?? undefined,
          projects: fallbackProjects,
        })
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [user, isLoaded])

  const startEdit = () => {
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setAbout(profile.about || '')
    setAvatarPreview(profile.avatar)
    setFormErrors({})
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setAvatarPreview(profile.avatar)
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: { firstName?: string } = {}
    if (!firstName.trim()) {
      errors.firstName = 'First name is required.'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveAllChanges = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving.')
      return
    }

    setSaving(true)
    const toastId = toast.loading('Saving your profile changes...')

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          about: about.trim(),
          avatar: avatarPreview || profile.avatar,
          projects: profile.projects,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || `Server responded with status ${res.status}`)
      }

      setProfile((prev) => ({
        ...prev,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        about: about.trim(),
        avatar: avatarPreview || prev.avatar,
      }))

      setEditing(false)
      setRecentlyDeletedProject(null)
      toast.success('Profile updated successfully!', { id: toastId })
    } catch (err: any) {
      console.error('Error saving profile:', err)
      toast.error(err?.message || 'Failed to save profile. Please try again.', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const onFileImmediate = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(String(reader.result))
      toast.success('Avatar preview updated. Click "Save Changes" to apply.')
    }
    reader.readAsDataURL(file)
  }

  const triggerAvatarPicker = () => avatarInputRef.current?.click()

  const handleProjectChange = (id: string, field: keyof Project, value: string) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects?.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }))
  }

  const handleAddProject = () => {
    const newProject: Project = {
      id: createId(),
      title: 'New Engineering Project',
      description: '',
    }
    setProfile((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProject],
    }))
    toast.success('Added new project card.')
  }

  const handleDeleteProject = (id: string) => {
    const projectIndex = (profile.projects || []).findIndex((p) => p.id === id)
    const targetProject = (profile.projects || []).find((p) => p.id === id)

    if (!targetProject) return

    setProfile((prev) => ({
      ...prev,
      projects: prev.projects?.filter((p) => p.id !== id),
    }))

    setRecentlyDeletedProject({ project: targetProject, index: projectIndex })

    toast('Project removed', {
      description: `"${targetProject.title}" has been deleted.`,
      action: {
        label: 'Undo',
        onClick: () => undoDeleteProject(targetProject, projectIndex),
      },
      duration: 6000,
    })
  }

  const undoDeleteProject = (restoredProject: Project, index: number) => {
    setProfile((prev) => {
      const currentProjects = [...(prev.projects || [])]
      currentProjects.splice(index, 0, restoredProject)
      return {
        ...prev,
        projects: currentProjects,
      }
    })
    setRecentlyDeletedProject(null)
    toast.success(`Restored "${restoredProject.title}"!`)
  }

  // Password accounts do not link external OAuth providers
  const connectedProviders: string[] = []

  if (loadingProfile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading student profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Student Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal identity, bio, connected engineering credentials, and portfolio showcase.
          </p>
        </div>

        {!editing ? (
          <Button
            onClick={startEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold gap-2 self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" onClick={cancelEdit} disabled={saving} className="border-slate-300">
              Cancel
            </Button>
            <Button
              onClick={saveAllChanges}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* RECENTLY DELETED UNDO BANNER */}
      {recentlyDeletedProject && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span>
              You removed <strong>{recentlyDeletedProject.project.title}</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => undoDeleteProject(recentlyDeletedProject.project, recentlyDeletedProject.index)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs"
          >
            <Undo2 size={14} /> Undo Deletion
          </button>
        </div>
      )}

      {/* PROFILE OVERVIEW CARD */}
      <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* AVATAR */}
            <div className="relative group shrink-0">
              <div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative ${
                  editing ? 'cursor-pointer ring-4 ring-blue-50 hover:border-blue-400' : ''
                }`}
                onClick={editing ? triggerAvatarPicker : undefined}
                title={editing ? 'Click to change avatar' : undefined}
              >
                {avatarPreview || profile.avatar ? (
                  <img
                    src={avatarPreview || profile.avatar}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    alt={`${profile.firstName} avatar`}
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}

                {editing && (
                  <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                    <Camera size={18} />
                    <span className="text-[10px] font-bold mt-1 uppercase">Change</span>
                  </div>
                )}
              </div>

              {editing && (
                <button
                  type="button"
                  onClick={triggerAvatarPicker}
                  className="sm:hidden mt-2 text-xs text-blue-600 font-semibold block text-center w-full"
                >
                  Change Photo
                </button>
              )}
            </div>

            {/* IDENTITY INFO */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {profile.firstName || 'Student'} {profile.lastName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 self-center sm:self-auto capitalize">
                  <ShieldCheck size={13} className="text-blue-600" />
                  {profile.role || 'Student'}
                </span>
              </div>

              <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <span>{profile.email}</span>
              </p>

              <p className="text-xs text-slate-400 pt-1">
                Account ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{user?.username}</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EDIT BASIC INFO FORM */}
      {editing && (
        <Card className="border border-blue-200 shadow-sm bg-blue-50/20 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-900">Basic Identity</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Update your primary display name shown across the learning workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    if (formErrors.firstName) setFormErrors({})
                  }}
                  className={`bg-white ${formErrors.firstName ? 'border-red-500 focus-visible:ring-red-400' : 'border-slate-200'}`}
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {formErrors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Last Name</label>
                <Input
                  placeholder="e.g. Vance"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ABOUT / BIOGRAPHY */}
      <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-900">About Me</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Tell peers, instructors, and hiring mentors about your technical background and engineering passions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-2">
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] bg-slate-50/50"
                placeholder="Share your background, programming languages you enjoy, and software systems you aspire to architect..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={2000}
              />
              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>Markdown formatting supported in public portfolio.</span>
                <span>{about.length} / 2000</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {profile.about || 'No bio provided yet. Click "Edit Profile" to write an overview of your engineering goals.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* CONNECTED ACCOUNTS */}
      <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-900">Connected Accounts</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Authenticated external integrations used for code review workflows, project repositories, and verifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* GITHUB */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/40">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">GitHub</p>
                <p className="text-xs text-slate-500">Repository syncing, SDLC commit tracking, and Capstone pull requests</p>
              </div>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold border ${
                connectedProviders.some((p) => p.includes('github'))
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {connectedProviders.some((p) => p.includes('github')) ? 'Connected' : 'Available'}
            </span>
          </div>

          {/* LINKEDIN */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/40">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shrink-0">
                <Linkedin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">LinkedIn</p>
                <p className="text-xs text-slate-500">Course certificate verification and alumni network integration</p>
              </div>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold border ${
                connectedProviders.some((p) => p.includes('linkedin'))
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {connectedProviders.some((p) => p.includes('linkedin')) ? 'Connected' : 'Available'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* PROJECT GALLERY */}
      <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
              <span>Project Showcase</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Highlight capstones, system builds, and personal software accomplishments.
            </CardDescription>
          </div>

          {editing && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddProject}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {(!profile.projects || profile.projects.length === 0) && (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-sm text-slate-500">No projects added yet.</p>
              {editing && (
                <Button size="sm" onClick={handleAddProject} className="mt-3 bg-blue-600 text-white text-xs">
                  Create First Project
                </Button>
              )}
            </div>
          )}

          {profile.projects?.map((p, idx) => (
            <div
              key={p.id}
              className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  {editing ? (
                    <Input
                      placeholder="Project Title (e.g. Distributed Task Queue)"
                      value={p.title}
                      onChange={(e) => handleProjectChange(p.id, 'title', e.target.value)}
                      className="font-bold text-slate-900 border-slate-200 bg-white"
                    />
                  ) : (
                    <h3 className="font-bold text-slate-900 text-base">{p.title || 'Untitled Project'}</h3>
                  )}
                </div>

                {editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 h-auto shrink-0 transition"
                    onClick={() => handleDeleteProject(p.id)}
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {editing ? (
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  placeholder="Outline key architectural patterns, database choices, and outcomes..."
                  value={p.description || ''}
                  onChange={(e) => handleProjectChange(p.id, 'description', e.target.value)}
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {p.description || 'No project description added yet.'}
                </p>
              )}
            </div>
          ))}

          {editing && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                You can undo any removed project card prior to saving.
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={cancelEdit} disabled={saving} size="sm">
                  Cancel
                </Button>
                <Button
                  onClick={saveAllChanges}
                  disabled={saving}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileImmediate}
      />
    </div>
  )
}
