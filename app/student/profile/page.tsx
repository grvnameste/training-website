//app/student/profile/page.tsx
'use client'
import React, { useEffect, useState, ChangeEvent, useRef } from 'react'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Linkedin, Edit3, Save, Camera, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface Project {
  id: string
  title: string
  description?: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string // 🔒 auth email
  phone?: string
  avatar?: string
  role?: string
  about?: string
  projects?: Project[]
}

// const safeParse = (s: string | null) => {
//   try {
//     return s ? JSON.parse(s) : null
//   } catch {
//     return null
//   }
// }

const createId = () =>
  `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`

const fallbackProjects: Project[] = [
  {
    id: 'p1',
    title: 'Project 1 – Smart Course Dashboard',
    description:
      'Built a responsive dashboard to track course progress and goals.',
  },
]

export default function StudentProfilePage() {
  const fallback: UserProfile = {
    firstName: 'Alex',
    lastName: 'Doe',
    email: '', // ⛔ placeholder removed
    role: 'Learner',
    about:
      'Passionate developer with a focus on creating intuitive user experiences.',
    projects: fallbackProjects,
  }

  const [user, setUser] = useState<UserProfile>(fallback)
  const [editing, setEditing] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>()

  const [providers, setProviders] = useState<string[]>([])


  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
  

      setProviders(
        authUser.identities?.map(i => i.provider) ?? []
      )
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
  
        if (error) {
          console.error('Profile load error:', error.message)
        
          // fallback (auth data se at least email dikhe)
          setUser((prev) => ({
            ...prev,
            email: authUser.email ?? '',
          }))
          return
        }
        
  
      setUser({
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
        email: authUser.email ?? '',
        avatar: data.avatar ?? undefined,
        about: data.about ?? '',
        role: data.role,
        projects: fallbackProjects,
      })
    }
  
    loadProfile()
  }, [])
  

  const connectProvider = async (provider: 'github' | 'linkedin') => {
    const supabaseProvider =
      provider === 'linkedin' ? 'linkedin_oidc' : provider
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider as any,
      options: {
        redirectTo: `${location.origin}/student/profile`,
      },
    })
  
    if (error) {
      alert(error.message)
    }
  }
  
  const startEdit = () => {
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setAvatarPreview(user.avatar)
    setEditing(true)
  }

  const saveAllChanges = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('First name and last name are required')
      return
    }
  
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
  
   

    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar: avatarPreview ?? user.avatar,
        about: user.about,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)
  
    if (error) {
      alert(error.message)
      return
    }
  
    setUser((prev) => ({
      ...prev,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatar: avatarPreview ?? prev.avatar,
    }))
  
    setEditing(false)
  }
  

  const onFileImmediate = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const triggerAvatarPicker = () => avatarInputRef.current?.click()

  const handleProjectChange = (
    id: string,
    field: keyof Project,
    value: string
  ) => {
    setUser((prev) => ({
      ...prev,
      projects: prev.projects?.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }))
  }

  const handleAddProject = () => {
    setUser((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { id: createId(), title: 'New project', description: '' },
      ],
    }))
  }

  const handleDeleteProject = (id: string) => {
    setUser((prev) => ({
      ...prev,
      projects: prev.projects?.filter((p) => p.id !== id),
    }))
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* HEADER */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold">Learner Profile</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* PROFILE HEADER */}
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div
                className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
                onClick={editing ? triggerAvatarPicker : undefined}
              >
                {(avatarPreview || user.avatar) && (
                  <img
                    src={avatarPreview || user.avatar}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                )}
                {!avatarPreview && !user.avatar && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Camera />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {!editing && (
              <Button variant="outline" onClick={startEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* BASIC INFO */}
        {editing && (
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* ABOUT */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <textarea
                className="w-full border rounded-md p-3"
                value={user.about}
                onChange={(e) =>
                  setUser((p) => ({ ...p, about: e.target.value }))
                }
              />
            ) : (
              <p className="text-sm">{user.about}</p>
            )}
          </CardContent>
        </Card>



{/* CONNECTED ACCOUNTS */}
<Card>
  <CardHeader>
    <CardTitle>Connected accounts</CardTitle>
    <p className="text-sm text-muted-foreground">
      Link your professional profiles for better visibility
    </p>
  </CardHeader>

  <CardContent className="space-y-4">

    {/* GITHUB */}
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
          <Github className="w-5 h-5" />
        </div>

        <div>
          <p className="text-sm font-medium">GitHub</p>
          <p className="text-xs text-muted-foreground">
            Used to showcase your projects & code
          </p>
        </div>
      </div>

      <Button
        variant={providers.includes('github') ? 'outline' : 'default'}
        disabled={providers.includes('github')}
        onClick={() => connectProvider('github')}
      >
        {providers.includes('github') ? 'Connected' : 'Connect'}
      </Button>
    </div>

    {/* LINKEDIN */}
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center">
          <Linkedin className="w-5 h-5" />
        </div>

        <div>
          <p className="text-sm font-medium">LinkedIn</p>
          <p className="text-xs text-muted-foreground">
            Used for certificates & professional profile
          </p>
        </div>
      </div>

      <Button
        variant={providers.includes('linkedin_oidc') ? 'outline' : 'default'}
        disabled={providers.includes('linkedin_oidc')}
        onClick={() => connectProvider('linkedin')}
      >
        {providers.includes('linkedin_oidc') ? 'Connected' : 'Connect'}
      </Button>
    </div>

  </CardContent>
</Card>


        {/* PROJECTS */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Project gallery</CardTitle>
            {editing && (
              <Button size="sm" variant="outline" onClick={handleAddProject}>
                + Add project
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {user.projects?.map((p) => (
              <div key={p.id} className="border rounded-md p-3 space-y-2">
                {editing && (
                  <button
                    className="text-xs text-red-500"
                    onClick={() => handleDeleteProject(p.id)}
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Remove
                  </button>
                )}
                <Input
                  disabled={!editing}
                  value={p.title}
                  onChange={(e) =>
                    handleProjectChange(p.id, 'title', e.target.value)
                  }
                />
                <textarea
                  disabled={!editing}
                  className="w-full border rounded-md p-2 text-sm"
                  value={p.description}
                  onChange={(e) =>
                    handleProjectChange(p.id, 'description', e.target.value)
                  }
                />
              </div>
            ))}

            {editing && (
              <div className="pt-4 border-t flex justify-end">
                <Button onClick={saveAllChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
