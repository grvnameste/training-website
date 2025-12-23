'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown, Trash2, Plus, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

/* ================= TYPES ================= */

type SectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'custom'

type ResumeSection = {
  id: string
  type: SectionType
  title: string
  data: any
}

/* ================= PAGE ================= */

export default function ResumePage() {
  const [name, setName] = useState('Your Name')
  const [contact, setContact] = useState(
    'City · email@example.com · +91 XXXXXXXX · LinkedIn · GitHub'
  )

  const [editingHeader, setEditingHeader] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

  /* ================= SECTIONS ================= */

  const [sections, setSections] = useState<ResumeSection[]>([
    {
      id: 'summary',
      type: 'summary',
      title: 'SUMMARY',
      data: {
        text:
          'Fill Your summary',
      },
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'WORK EXPERIENCE',
      data: {
        role: 'eg. Fullstack Developer',
        company: 'company name',
        start: 'Start Date',
        end: 'End Date',
        location: 'NA',
        description:
          'experience description',
      },
    },
    {
      id: 'education',
      type: 'education',
      title: 'EDUCATION',
      data: {
        degree: 'Bachelor of Computer Science',
        institute: 'Your College Name',
        start: 'May 2022',
        end: 'Present',
        extra: 'CGPA: 5.86',
      },
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'PROJECTS',
      data: {
        name: 'Your Project name',
        link: 'https://example.com',
        description:
          'Description of your project.',
      },
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'SKILLS',
      data: {
        list:
          'React.js, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind, Node.js, MongoDB',
      },
    },
  ])

  /* ================= HELPERS ================= */

  const updateSectionData = (id: string, field: string, value: string) => {
    setSections(prev =>
      prev.map(s =>
        s.id === id ? { ...s, data: { ...s.data, [field]: value } } : s
      )
    )
  }

  const moveSection = (index: number, dir: 'up' | 'down') => {
    setSections(prev => {
      const copy = [...prev]
      const target = dir === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= copy.length) return prev
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy
    })
  }

  const deleteSection = (id: string) => {
    if (!confirm('Remove this section?')) return
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const addSection = () => {
    const title = prompt('Section title')
    if (!title) return
    setSections(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'custom',
        title: title.toUpperCase(),
        data: { text: '' },
      },
    ])
  }

  /* ================= EDITOR ================= */

  const renderEditor = (s: ResumeSection) => {
    switch (s.type) {
      case 'summary':
        return (
          <Textarea
            rows={4}
            value={s.data.text}
            onChange={e =>
              updateSectionData(s.id, 'text', e.target.value)
            }
          />
        )

      case 'experience':
        return (
          <div className="space-y-2">
            <Input
              placeholder="Role"
              value={s.data.role}
              onChange={e =>
                updateSectionData(s.id, 'role', e.target.value)
              }
            />
            <Input
              placeholder="Company"
              value={s.data.company}
              onChange={e =>
                updateSectionData(s.id, 'company', e.target.value)
              }
            />
            <div className="flex gap-2">
              <Input
                placeholder="Start"
                value={s.data.start}
                onChange={e =>
                  updateSectionData(s.id, 'start', e.target.value)
                }
              />
              <Input
                placeholder="End"
                value={s.data.end}
                onChange={e =>
                  updateSectionData(s.id, 'end', e.target.value)
                }
              />
            </div>
            <Textarea
              rows={3}
              placeholder="Work description"
              value={s.data.description}
              onChange={e =>
                updateSectionData(s.id, 'description', e.target.value)
              }
            />
          </div>
        )

      case 'education':
        return (
          <div className="space-y-2">
            <Input
              placeholder="Degree"
              value={s.data.degree}
              onChange={e =>
                updateSectionData(s.id, 'degree', e.target.value)
              }
            />
            <Input
              placeholder="Institute"
              value={s.data.institute}
              onChange={e =>
                updateSectionData(s.id, 'institute', e.target.value)
              }
            />
            <div className="flex gap-2">
              <Input
                placeholder="Start"
                value={s.data.start}
                onChange={e =>
                  updateSectionData(s.id, 'start', e.target.value)
                }
              />
              <Input
                placeholder="End"
                value={s.data.end}
                onChange={e =>
                  updateSectionData(s.id, 'end', e.target.value)
                }
              />
            </div>
            <Input
              placeholder="CGPA / Extra info"
              value={s.data.extra}
              onChange={e =>
                updateSectionData(s.id, 'extra', e.target.value)
              }
            />
          </div>
        )

      case 'projects':
        return (
          <div className="space-y-2">
            <Input
              placeholder="Project name"
              value={s.data.name}
              onChange={e =>
                updateSectionData(s.id, 'name', e.target.value)
              }
            />
            <Input
              placeholder="Project link"
              value={s.data.link}
              onChange={e =>
                updateSectionData(s.id, 'link', e.target.value)
              }
            />
            <Textarea
              rows={3}
              placeholder="Project description"
              value={s.data.description}
              onChange={e =>
                updateSectionData(s.id, 'description', e.target.value)
              }
            />
          </div>
        )

      case 'skills':
        return (
          <Textarea
            rows={3}
            placeholder="Comma separated skills"
            value={s.data.list}
            onChange={e =>
              updateSectionData(s.id, 'list', e.target.value)
            }
          />
        )

      default:
        return (
          <Textarea
            rows={5}
            value={s.data.text || ''}
            onChange={e =>
              updateSectionData(s.id, 'text', e.target.value)
            }
          />
        )
    }
  }

  /* ================= PREVIEW ================= */

  const renderPreview = (s: ResumeSection) => {
    switch (s.type) {
      case 'summary':
        return <p>{s.data.text}</p>

      case 'experience':
        return (
          <div>
            <div className="flex justify-between font-semibold">
              <span>{s.data.role}</span>
              <span>
                {s.data.start} – {s.data.end}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{s.data.company}</span>
              <span>{s.data.location}</span>
            </div>
            <p className="mt-1">{s.data.description}</p>
          </div>
        )

      case 'education':
        return (
          <div>
            <div className="flex justify-between font-semibold">
              <span>{s.data.degree}</span>
              <span>
                {s.data.start} – {s.data.end}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{s.data.institute}</span>
              <span>{s.data.extra}</span>
            </div>
          </div>
        )

      case 'projects':
        return (
          <div>
            <strong>{s.data.name}</strong>{' '}
            <span className="text-sm underline">{s.data.link}</span>
            <p>{s.data.description}</p>
          </div>
        )

      case 'skills':
        return (
          <p>
            <strong>Skill Category:</strong> {s.data.list}
          </p>
        )

      default:
        return <p className="whitespace-pre-line">{s.data.text}</p>
    }
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[13px] leading-relaxed">
      {/* HEADER */}
      <div className="text-center">
        {editingHeader ? (
          <>
            <Input value={name} onChange={e => setName(e.target.value)} />
            <Input
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
            <Button size="sm" onClick={() => setEditingHeader(false)}>
              <Check className="w-4 h-4 mr-1" /> Done
            </Button>
          </>
        ) : (
          <>
            <div className="text-lg font-bold">{name}</div>
            <div>{contact}</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingHeader(true)}
            >
              <Pencil size={14} /> Edit
            </Button>
          </>
        )}
      </div>

      <Card className="p-8">
        {sections.map((s, index) => (
          <section key={s.id} className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="font-bold tracking-wide">{s.title}</h2>
              <div className="flex gap-1">
                <button onClick={() => setEditingSectionId(s.id)}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => moveSection(index, 'up')}>
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => moveSection(index, 'down')}>
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => deleteSection(s.id)}
                  className="text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <hr className="my-2" />

            {editingSectionId === s.id ? (
              <>
                {renderEditor(s)}
                <Button
                  size="sm"
                  onClick={() => setEditingSectionId(null)}
                >
                  <Check className="w-4 h-4 mr-1" /> Save
                </Button>
              </>
            ) : (
              renderPreview(s)
            )}
          </section>
        ))}

        <div className="text-center">
          <Button variant="outline" onClick={addSection}>
            <Plus className="w-4 h-4 mr-1" /> Add Section
          </Button>
        </div>
      </Card>
    </div>
  )
}
