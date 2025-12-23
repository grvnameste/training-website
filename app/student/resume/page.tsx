'use client'

import { useState } from 'react'
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Pencil,
  Check,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

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

export default function ResumePage() {
  const [name, setName] = useState('Your Name')
  const [contact, setContact] = useState(
    'City · email@example.com · +91 XXXXXXXX · LinkedIn · GitHub'
  )

  const [editingHeader, setEditingHeader] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

  const [sections, setSections] = useState<ResumeSection[]>([
    { id: 'summary', type: 'summary', title: 'SUMMARY', data: { text: '' } },
    {
      id: 'experience',
      type: 'experience',
      title: 'WORK EXPERIENCE',
      data: {
        company: '',
        role: '',
        location: '',
        start: '',
        end: '',
        description: '',
      },
    },
    {
      id: 'education',
      type: 'education',
      title: 'EDUCATION',
      data: {
        institute: '',
        degree: '',
        gpa: '',
        start: '',
        end: '',
        extra: '',
      },
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'PROJECTS',
      data: {
        items: [
          {
            name: '',
            link: '',
            start: '',
            end: '',
            description: '',
          },
        ],
      },
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'SKILLS',
      data: { list: '' },
    },
  ])

  const update = (id: string, key: string, value: string) => {
    setSections(secs =>
      secs.map(sec =>
        sec.id === id
          ? { ...sec, data: { ...sec.data, [key]: value } }
          : sec
      )
    )
  }

  const updateProject = (
    sectionId: string,
    index: number,
    key: string,
    value: string
  ) => {
    setSections(secs =>
      secs.map(sec => {
        if (sec.id !== sectionId) return sec
        const items = [...sec.data.items]
        items[index] = { ...items[index], [key]: value }
        return { ...sec, data: { items } }
      })
    )
  }

  const move = (i: number, d: -1 | 1) => {
    setSections(s => {
      const copy = [...s]
      const t = i + d
      if (t < 0 || t >= copy.length) return s
      ;[copy[i], copy[t]] = [copy[t], copy[i]]
      return copy
    })
  }

  const addSection = () => {
    const title = prompt('Section title')
    if (!title) return
    setSections(s => [
      ...s,
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
    if (s.type === 'summary' || s.type === 'custom') {
      return (
        <Textarea
          rows={4}
          placeholder="Write here..."
          value={s.data.text}
          onChange={e => update(s.id, 'text', e.target.value)}
        />
      )
    }

    if (s.type === 'skills') {
      return (
        <Textarea
          rows={3}
          placeholder="Comma separated skills"
          value={s.data.list}
          onChange={e => update(s.id, 'list', e.target.value)}
        />
      )
    }

    if (s.type === 'projects') {
      return (
        <div className="space-y-4">
          {s.data.items.map((p: any, i: number) => (
            <div key={i} className="border p-3 rounded-md space-y-2">
              <Input
                placeholder="Project Name"
                value={p.name}
                onChange={e =>
                  updateProject(s.id, i, 'name', e.target.value)
                }
              />
              <Input
                placeholder="Project Link"
                value={p.link}
                onChange={e =>
                  updateProject(s.id, i, 'link', e.target.value)
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Start"
                  value={p.start}
                  onChange={e =>
                    updateProject(s.id, i, 'start', e.target.value)
                  }
                />
                <Input
                  placeholder="End"
                  value={p.end}
                  onChange={e =>
                    updateProject(s.id, i, 'end', e.target.value)
                  }
                />
              </div>
              <Textarea
                rows={3}
                placeholder="Description"
                value={p.description}
                onChange={e =>
                  updateProject(s.id, i, 'description', e.target.value)
                }
              />

              {s.data.items.length > 1 && (
                <button
                  className="text-xs text-red-500 no-print"
                  onClick={() =>
                    setSections(secs =>
                      secs.map(sec =>
                        sec.id === s.id
                          ? {
                              ...sec,
                              data: {
                                items: sec.data.items.filter(
                                  (_: any, idx: number) => idx !== i
                                ),
                              },
                            }
                          : sec
                      )
                    )
                  }
                >
                  Remove Project
                </button>
              )}
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setSections(secs =>
                secs.map(sec =>
                  sec.id === s.id
                    ? {
                        ...sec,
                        data: {
                          items: [
                            ...sec.data.items,
                            {
                              name: '',
                              link: '',
                              start: '',
                              end: '',
                              description: '',
                            },
                          ],
                        },
                      }
                    : sec
                )
              )
            }
          >
            <Plus size={14} /> Add New Project
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(s.data).map(key =>
          key === 'description' || key === 'extra' ? (
            <Textarea
              key={key}
              className="col-span-2"
              rows={3}
              placeholder={key.replace('_', ' ')}
              value={s.data[key]}
              onChange={e => update(s.id, key, e.target.value)}
            />
          ) : (
            <Input
              key={key}
              placeholder={key.replace('_', ' ')}
              value={s.data[key]}
              onChange={e => update(s.id, key, e.target.value)}
            />
          )
        )}
      </div>
    )
  }

  /* ================= PREVIEW ================= */

  const renderPreview = (s: ResumeSection) => {
    switch (s.type) {
      case 'summary':
      case 'custom':
        return <p className="leading-relaxed">{s.data.text}</p>

      case 'skills':
        return <p>{s.data.list}</p>

      case 'experience':
        return (
          <>
            <div className="flex justify-between font-semibold">
              <span>{s.data.role}</span>
              <span className="text-sm">
                {s.data.start} – {s.data.end}
              </span>
            </div>
            <div className="text-sm mb-1">
              {s.data.company} · {s.data.location}
            </div>
            <p>{s.data.description}</p>
          </>
        )

      case 'education':
        return (
          <>
            <div className="flex justify-between font-semibold">
              <span>{s.data.degree}</span>
              <span className="text-sm">
                {s.data.start} – {s.data.end}
              </span>
            </div>
            <div className="text-sm mb-1">
              {s.data.institute} · {s.data.gpa}
            </div>
            <p>{s.data.extra}</p>
          </>
        )

      case 'projects':
        return (
          <div className="space-y-4">
            {s.data.items.map((p: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between font-semibold">
                  <span>{p.name}</span>
                  <span className="text-sm">
                    {p.start} – {p.end}
                  </span>
                </div>
                {p.link && (
                  <div className="text-sm underline mb-1">{p.link}</div>
                )}
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex justify-end no-print">
        <Button size="sm" onClick={() => window.print()}>
          <Download size={14} className="mr-1" /> Download PDF
        </Button>
      </div>

      <div id="resume-print">
        <Card className="p-8">
          <section className="mb-8 text-center">
            {editingHeader ? (
              <>
                <Input value={name} onChange={e => setName(e.target.value)} />
                <Input
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                />
                <Button size="sm" onClick={() => setEditingHeader(false)}>
                  <Check size={14} /> Save
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold tracking-wide">{name}</h1>
                <p className="text-sm">{contact}</p>
                <button
                  onClick={() => setEditingHeader(true)}
                  className="no-print mt-1"
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
          </section>

          {sections.map((s, i) => (
            <section key={s.id} className="mb-8">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-sm tracking-wide uppercase">
                  {s.title}
                </h2>
                <div className="flex gap-1 no-print">
                  <button onClick={() => setEditingSectionId(s.id)}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => move(i, -1)}>
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => move(i, 1)}>
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setSections(x => x.filter(y => y.id !== s.id))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <hr className="mt-1 mb-4 border-t border-gray-400" />

              {editingSectionId === s.id ? (
                <>
                  {renderEditor(s)}
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => setEditingSectionId(null)}
                  >
                    <Check size={14} /> Save
                  </Button>
                </>
              ) : (
                renderPreview(s)
              )}
            </section>
          ))}

          <div className="text-center no-print">
            <Button variant="outline" onClick={addSection}>
              <Plus size={14} /> Add Section
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
