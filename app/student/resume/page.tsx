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
  Layout,
  User,
  Layers,
  Sparkles,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

type SectionType = 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom'

type ResumeSection = {
  id: string
  type: SectionType
  title: string
  data: any
}

export default function ResumePage() {
  const [name, setName] = useState('Your Name')
  const [contact, setContact] = useState('City · email@example.com · +91 XXXXXXXX · LinkedIn · GitHub')
  const [editingHeader, setEditingHeader] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

  const [sections, setSections] = useState<ResumeSection[]>([
    { id: 'summary', type: 'summary', title: 'SUMMARY', data: { text: '' } },
    {
      id: 'experience',
      type: 'experience',
      title: 'WORK EXPERIENCE',
      data: { company: '', role: '', location: '', start: '', end: '', description: '' },
    },
    {
      id: 'education',
      type: 'education',
      title: 'EDUCATION',
      data: { institute: '', degree: '', gpa: '', start: '', end: '', extra: '' },
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'PROJECTS',
      data: {
        items: [{ name: '', link: '', start: '', end: '', description: '' }],
      },
    },
    { id: 'skills', type: 'skills', title: 'SKILLS', data: { list: '' } },
  ])

  const update = (id: string, key: string, value: string) => {
    setSections(secs => secs.map(sec => sec.id === id ? { ...sec, data: { ...sec.data, [key]: value } } : sec))
  }

  const updateProject = (sectionId: string, index: number, key: string, value: string) => {
    setSections(secs => secs.map(sec => {
      if (sec.id !== sectionId) return sec
      const items = [...sec.data.items]
      items[index] = { ...items[index], [key]: value }
      return { ...sec, data: { items } }
    }))
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
    setSections(s => [...s, { id: Date.now().toString(), type: 'custom', title: title.toUpperCase(), data: { text: '' } }])
  }

  const renderEditor = (s: ResumeSection) => {
    if (s.type === 'summary' || s.type === 'custom') {
      return <Textarea rows={4} placeholder="Write something impactful..." value={s.data.text} onChange={e => update(s.id, 'text', e.target.value)} className="bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all rounded-xl shadow-inner" />
    }
    if (s.type === 'skills') {
      return <Textarea rows={3} placeholder="React, Next.js, TypeScript..." value={s.data.list} onChange={e => update(s.id, 'list', e.target.value)} className="bg-white border-slate-200 rounded-xl" />
    }
    if (s.type === 'projects') {
      return (
        <div className="space-y-4">
          {s.data.items.map((p: any, i: number) => (
            <div key={i} className="border border-slate-100 p-5 rounded-2xl bg-white space-y-3 relative group shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project #{i + 1}</span>
                {s.data.items.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={() => setSections(secs => secs.map(sec => sec.id === s.id ? { ...sec, data: { items: sec.data.items.filter((_: any, idx: number) => idx !== i ) } } : sec))}>
                      <Trash2 size={14} />
                    </Button>
                  )}
              </div>
              <Input placeholder="Project Name" value={p.name} onChange={e => updateProject(s.id, i, 'name', e.target.value)} className="font-bold" />
              <Input placeholder="Live Link (optional)" value={p.link} onChange={e => updateProject(s.id, i, 'link', e.target.value)} className="text-blue-600" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Start Date" value={p.start} onChange={e => updateProject(s.id, i, 'start', e.target.value)} />
                <Input placeholder="End Date" value={p.end} onChange={e => updateProject(s.id, i, 'end', e.target.value)} />
              </div>
              <Textarea rows={3} placeholder="Describe your achievements..." value={p.description} onChange={e => updateProject(s.id, i, 'description', e.target.value)} />
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full border-dashed border-2 hover:bg-blue-50 hover:border-blue-200 text-blue-600 rounded-xl py-6" onClick={() => setSections(secs => secs.map(sec => sec.id === s.id ? { ...sec, data: { items: [...sec.data.items, { name: '', link: '', start: '', end: '', description: '' }] } } : sec))}>
            <Plus size={16} className="mr-2" /> Add Another Project
          </Button>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(s.data).map(key => key === 'description' || key === 'extra' ? (
          <Textarea key={key} className="col-span-2 bg-white rounded-xl" rows={3} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} value={s.data[key]} onChange={e => update(s.id, key, e.target.value)} />
        ) : (
          <Input key={key} className="bg-white rounded-xl" placeholder={key.charAt(0).toUpperCase() + key.slice(1)} value={s.data[key]} onChange={e => update(s.id, key, e.target.value)} />
        ))}
      </div>
    )
  }

  const renderPreview = (s: ResumeSection) => {
    switch (s.type) {
      case 'summary': case 'custom': return <p className="text-[10.5pt] leading-[1.4] text-gray-700 whitespace-pre-wrap">{s.data.text}</p>
      case 'skills': return (
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10.5pt] text-gray-800">
          {s.data.list.split(',').map((skill: string, i: number) => skill.trim() && (
            <span key={i} className="after:content-[','] last:after:content-[''] font-semibold text-slate-900">{skill.trim()}</span>
          ))}
        </div>
      )
      case 'experience': return (
        <div className="text-[10.5pt]">
          <div className="flex justify-between font-bold text-gray-900 mb-0.5">
            <span className="text-[11pt] tracking-tight">{s.data.role}</span>
            <span className="font-medium text-slate-500">{s.data.start} – {s.data.end}</span>
          </div>
          <div className="flex justify-between italic text-gray-800 mb-2">
            <span>{s.data.company}</span>
            <span>{s.data.location}</span>
          </div>
          <p className="text-gray-600 leading-[1.4] whitespace-pre-wrap">{s.data.description}</p>
        </div>
      )
      case 'education': return (
        <div className="text-[10.5pt]">
          <div className="flex justify-between font-bold text-gray-900">
            <span className="text-[11pt] tracking-tight">{s.data.degree}</span>
            <span className="font-medium text-slate-500">{s.data.start} – {s.data.end}</span>
          </div>
          <div className="text-gray-800 font-medium italic mt-0.5">{s.data.institute} {s.data.gpa && `· GPA: ${s.data.gpa}`}</div>
          <p className="text-gray-600 mt-2 leading-[1.4] whitespace-pre-wrap">{s.data.extra}</p>
        </div>
      )
      case 'projects': return (
        <div className="space-y-4">
          {s.data.items.map((p: any, i: number) => (
            <div key={i} className="text-[10.5pt]">
              <div className="flex justify-between font-bold text-gray-900 mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11pt] tracking-tight">{p.name}</span>
                  {p.link && <span className="font-medium text-blue-600 underline text-[9.5pt] tracking-normal">{p.link}</span>}
                </div>
                <span className="font-medium text-slate-500">{p.start} – {p.end}</span>
              </div>
              <p className="text-gray-600 leading-[1.4] whitespace-pre-wrap">{p.description}</p>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-blue-100">
      {/* GLOSSY NAVBAR */}
      <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 no-print">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                <Layout className="text-white" size={24} />
            </div>
            <div>
                <span className="font-black text-xl text-slate-900 tracking-tight">ReadnRevise <span className="text-blue-600">Resume</span></span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Sparkles size={10} /> AI Enhanced Builder
                </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={addSection} className="rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
              <Plus size={18} className="mr-2 text-blue-600" /> New Section
            </Button>
            <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-black text-white px-6 rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-95">
              <Download size={18} className="mr-2" /> Download PDF
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: CONTROLS (THE BUILDER) */}
          <div className="lg:col-span-5 space-y-8 no-print">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm">
                    <User size={16} className="text-blue-500" /> Profile Information
                </h2>
              </div>
              <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200/60 bg-white/50 backdrop-blur-sm rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex flex-col">
                        <span className="font-bold text-slate-800 tracking-tight">{name}</span>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{contact}</span>
                   </div>
                   <Button variant="outline" size="sm" onClick={() => setEditingHeader(!editingHeader)} className={`rounded-xl border-slate-200 transition-all ${editingHeader ? 'bg-blue-600 text-white border-blue-600' : ''}`}>
                      {editingHeader ? <Check size={16} /> : <Pencil size={14} />}
                   </Button>
                </div>
                <AnimatePresence>
                    {editingHeader && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 pt-2 border-t border-slate-100 overflow-hidden">
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="bg-white rounded-xl" />
                        <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Location · Email · Phone · Links" className="bg-white rounded-xl" />
                    </motion.div>
                    )}
                </AnimatePresence>
              </Card>

              <div className="flex items-center justify-between px-1 pt-4">
                <h2 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm">
                    <Layers size={16} className="text-blue-500" /> Resume Sections
                </h2>
              </div>
              
              <div className="space-y-4">
                {sections.map((s, i) => (
                  <Card key={s.id} className={`group border-none shadow-sm ring-1 transition-all duration-300 rounded-[2rem] overflow-hidden ${editingSectionId === s.id ? 'ring-blue-500 bg-white shadow-xl shadow-blue-100/50' : 'ring-slate-200 bg-white/40 hover:bg-white'}`}>
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="cursor-grab text-slate-300 hover:text-slate-400"><GripVertical size={16} /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{s.type}</span>
                            <span className="font-bold text-slate-800 tracking-tight">{s.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-900" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={16}/></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-900" onClick={() => move(i, 1)} disabled={i === sections.length - 1}><ArrowDown size={16}/></Button>
                        <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-full transition-colors ${editingSectionId === s.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-400 hover:bg-slate-100'}`} onClick={() => setEditingSectionId(editingSectionId === s.id ? null : s.id)}>
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-red-300 hover:text-red-500 hover:bg-red-50" onClick={() => setSections(x => x.filter(y => y.id !== s.id))}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {editingSectionId === s.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100 bg-slate-50/50">
                          <div className="p-6">
                            {renderEditor(s)}
                            <Button size="lg" className="mt-6 w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-100" onClick={() => setEditingSectionId(null)}>
                              Save Section
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PREVIEW (THE PAPER) */}
          <div className="lg:col-span-7 flex justify-center pb-20 sticky top-32">
            <div id="resume-print" className="bg-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.12)] w-full max-w-[210mm] min-h-[297mm] p-[18mm] md:p-[25mm] transition-all duration-500 ring-1 ring-slate-100 rounded-sm">
              
              <header className="text-center mb-10">
                <h1 className="text-[26pt] font-black tracking-[-0.03em] uppercase text-slate-900 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                  {name}
                </h1>
                <p className="text-[10pt] text-slate-600 font-medium tracking-tight max-w-3xl mx-auto border-t border-slate-100 pt-4">
                  {contact}
                </p>
              </header>

              <div className="space-y-8">
                {sections.map((s) => (
                  <section key={s.id} className="relative group">
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-[11pt] font-black tracking-[0.15em] uppercase text-slate-900 shrink-0">
                        {s.title}
                      </h2>
                      <div className="h-[2px] w-full bg-slate-900" />
                    </div>
                    <div className="text-gray-800 leading-relaxed px-1">
                      {renderPreview(s)}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-20 pt-10 border-t border-slate-50 text-center text-[9pt] text-slate-300 italic no-print">
                Interactive Preview Mode · Generated via ReadnRevise
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');
        
        :root {
            --font-serif: 'Crimson Pro', serif;
        }

        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          #resume-print { 
            box-shadow: none !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            width: 100% !important;
            max-width: none !important;
            ring: none !important;
            border: none !important;
          }
          @page { size: A4; margin: 0; }
        }

        #resume-print { font-family: var(--font-serif); }
        #resume-print h1, #resume-print h2 { font-family: var(--font-serif); }
      `}</style>
    </div>
  )
}