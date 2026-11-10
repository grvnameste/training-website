'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  PlayCircle, 
  Lock, 
  Clock, 
  ChevronLeft, 
  Github, 
  Linkedin, 
  Share2, 
  CheckCircle2,
  BookOpen
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// --- Types Re-declared for clarity ---
type Lesson = { id: string; title: string; description: string; duration: string; }
type Section = { id: string; title: string; lessons: Lesson[]; }
type Course = { id: string; title: string; subtitle: string; description: string; price: number; thumbnail_url: string; }

export default function CoursePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const EARLY_ACCESS_COURSE_ID = 'a54443c0-533e-435c-8a2f-ad89f9e07c95'

  useEffect(() => {
    if (id) fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    const { data: courseData, error } = await supabase
      .from('courses')
      .select(`id, title, subtitle, description, price, thumbnail_url`)
      .eq('id', id)
      .single()

    if (error || !courseData) {
      setLoading(false)
      return
    }

    setCourse(courseData)

    const { data: sectionsData } = await supabase
      .from('sections')
      .select(`id, title, order_index, lessons ( id, title, description, duration )`)
      .eq('course_id', id)
      .order('order_index', { ascending: true })

    setSections(sectionsData || [])
    setLoading(false)
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  )

  if (!course) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-slate-800">Course not found</h2>
      <Link href="/courses"><Button variant="outline">Browse All Courses</Button></Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
        <Image
          src={course.thumbnail_url || "/default-course.png"}
          alt={course.title}
          fill
          className="object-cover opacity-40 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="relative mx-auto max-w-6xl px-6 h-full flex flex-col justify-end pb-12">
          <Link href="/courses" className="absolute top-8 left-6 group">
            <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back to Catalog</span>
            </div>
          </Link>
          
          <div className="max-w-3xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              {course.price === 0 ? 'Free Certification' : 'Premium Course'}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl line-clamp-2">
              {course.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="mx-auto max-w-6xl px-6 -mt-10 grid gap-10 lg:grid-cols-3 relative z-10">
        
        {/* LEFT COLUMN: ABOUT & CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About This Course */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Course</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
            
            <div className="mt-8 flex items-center gap-6 border-t border-slate-100 pt-6">
               <div className="flex items-center gap-2 text-slate-500">
                  <Share2 size={18} />
                  <span className="text-sm">Share on:</span>
               </div>
               <a 
  href="https://www.linkedin.com/company/readnrevise/posts/?feedView=all"
  target="_blank"
  rel="noopener noreferrer"
  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-[#0077b5]"
>
  <Linkedin size={20} />
</a>

<a 
  href="https://github.com/ReadNRevise"
  target="_blank"
  rel="noopener noreferrer"
  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-[#333]"
>
  <Github size={20} />
</a>
            </div>
          </section>

          {/* Course Content Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="text-blue-600" /> Course Curriculum
              </h2>
              <span className="text-sm text-slate-500 font-medium">
                {sections.length} Sections • {sections.reduce((acc, s) => acc + s.lessons.length, 0)} Lessons
              </span>
            </div>

            <div className="space-y-4">
              {sections.map((section, sIdx) => (
                <div key={section.id} className="group">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400 px-2">
                    Section {sIdx + 1}: {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.lessons.map((lesson, lIdx) => (
                      <div 
                        key={lesson.id} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group/item"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-50 group-hover/item:text-blue-600 transition-colors">
                            <PlayCircle size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {lIdx + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} /> {lesson.duration || '10m'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Lock size={16} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: PRICING / CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {course.id === EARLY_ACCESS_COURSE_ID ? (
              /* --- EARLY ACCESS PREMIUM CARD --- */
              <div className="overflow-hidden rounded-[2.5rem] bg-indigo-600 p-[2px] shadow-2xl shadow-indigo-200">
                <div className="rounded-[2.4rem] bg-white p-8">
                  <div className="mb-6 flex justify-center">
                    <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold text-indigo-700 animate-pulse">
                      🚀 JOIN THE WAITLIST
                    </span>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black text-slate-900">Be an Early Bird</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Get exclusive founder pricing and access to private community channels when we go live.
                    </p>
                    
                    <a 
                      href="https://forms.gle/7pBGSViM7N6wk2RX7" 
                      target="_blank" 
                      className="block pt-4"
                    >
                      <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95">
                        Get Early Access
                      </Button>
                    </a>
                    
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span>Pre-launch discount included</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span>Lifetime updates guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- NORMAL COURSE CARD --- */
              <Card className="rounded-[2rem] border-none bg-white p-2 shadow-xl shadow-slate-200/60 overflow-hidden">
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-400">Total Investment</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">
                      {course.price === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${course.price}`
                      )}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <Link href="/login" className="block w-full">
                      <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-100">
                        Enroll Now
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold">
                      Add to Wishlist
                    </Button>
                  </div>

                  <div className="mt-8 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">This course includes:</p>
                    <div className="space-y-3">
                      {[
                        { icon: BookOpen, text: 'Self-paced learning' },
                        { icon: CheckCircle2, text: 'Certificate of completion' },
                        { icon: PlayCircle, text: 'Full HD Video lessons' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <item.icon size={18} className="text-blue-500" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}