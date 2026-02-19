import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  sections: Section[]
}

export function useStudentCourse(courseId: string, videoId: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [capstoneCourse, setCapstoneCourse] = useState<{ id: string; title: string } | null>(null)
  const [capstoneStage, setCapstoneStage] = useState(1)
  const [stage3Submitted, setStage3Submitted] = useState(false)
  const [capstoneCompleted, setCapstoneCompleted] = useState(false)
  const [certificateIssued, setCertificateIssued] = useState(false)
  const [certificateRequested, setCertificateRequested] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [meeting, setMeeting] = useState<{
    meeting_link: string
    meeting_date: string
    meeting_time: string
    notes: string
  } | null>(null)

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true)
        setMeeting(null)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, name')
            .eq('id', authUser.id)
            .maybeSingle()
            
          setUser({
            id: authUser.id,
            name: profile?.full_name || profile?.name || authUser.email?.split('@')[0] || 'Student'
          })

          // Enrollment check
          const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('student_id', authUser.id)
            .eq('course_id', courseId)
            .maybeSingle()

          setIsEnrolled(!!enrollment)
        }

        const { data: courseData } = await supabase
          .from('courses')
          .select('id, title, is_capstone, teacher_id')
          .eq('id', courseId)
          .single()

        if (!courseData) return
        setTeacherId(courseData.teacher_id)

        const { data: sections } = await supabase
          .from('sections')
          .select('id, title')
          .eq('course_id', courseId)

        const sectionIds = sections?.map(s => s.id) || []
        let sectionsWithLessons: Section[] = []

        if (sectionIds.length > 0) {
          const { data: lessonData } = await supabase
            .from('lessons')
            .select('id, title, description, video_url, section_id')
            .in('section_id', sectionIds)
            .order('order_index', { ascending: true })

          const lessonsBySection: Record<string, Lesson[]> = {}
          lessonData?.forEach(lesson => {
            if (!lessonsBySection[lesson.section_id]) lessonsBySection[lesson.section_id] = []
            lessonsBySection[lesson.section_id].push(lesson)
          })

          sectionsWithLessons = (sections ?? []).map(section => ({
            id: section.id,
            title: section.title,
            lessons: lessonsBySection[section.id] || [],
          }))
        }

        // Capstone Fetch
        let capstoneData = null
        if (courseData.is_capstone) {
          capstoneData = { id: courseId, title: courseData.title }
        } else {
          const { data } = await supabase
            .from('courses')
            .select('id, title')
            .eq('parent_course_id', courseId)
            .eq('is_capstone', true)
            .maybeSingle()
          capstoneData = data
        }
        setCapstoneCourse(capstoneData)

        // Capstone Progress
        if (capstoneData && authUser) {
          const { data: progress } = await supabase
            .from('student_capstone_progress')
            .select('*')
            .eq('student_id', authUser.id)
            .eq('capstone_id', capstoneData.id)
            .maybeSingle()

          setCapstoneStage(progress?.current_stage ?? 1)
          setStage3Submitted(!!progress?.stage3_submitted)
          setCapstoneCompleted(!!progress?.completed)
          setCertificateIssued(!!progress?.certificate_issued)
          setCertificateRequested(!!progress?.certificate_requested)

          // Meeting Fetch
          try {
            let res = await fetch(`/api/capstone/meeting?capstoneId=${capstoneData.id}&studentId=${authUser.id}`)
            let mData = res.ok ? await res.json() : null
            if (!mData) {
              res = await fetch(`/api/capstone/meeting?capstoneId=${courseId}&studentId=${authUser.id}`)
              mData = res.ok ? await res.json() : null
            }
            setMeeting(mData)
          } catch (e) {}
        }

        setCourse({
          id: courseData.id,
          title: courseData.title,
          sections: sectionsWithLessons,
        })
      } catch (error) {
        console.error('Error loading course:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, videoId])

  return {
    course,
    loading,
    isEnrolled,
    capstoneCourse,
    capstoneStage,
    stage3Submitted,
    capstoneCompleted,
    certificateIssued,
    certificateRequested,
    setCertificateRequested,
    user,
    teacherId,
    meeting
  }
}
