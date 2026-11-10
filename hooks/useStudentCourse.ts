//hooks/useStudentCourse.ts
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { useUser } from "@clerk/nextjs"

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
  const { user: authUser } = useUser()
  const [meeting, setMeeting] = useState<{
    meeting_link: string
    meeting_date: string
    meeting_time: string
    notes: string
  } | null>(null)

  useEffect(() => {
    let uuid: string | null = null
    const fetchCapstoneProgress = async (capstoneId: string, studentId: string) => {
      const { data: progress } = await supabase
        .from('student_capstone_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('capstone_id', capstoneId)
        .maybeSingle()
    
      console.log("REALTIME PROGRESS:", progress)
    
      if (progress) {
        setCapstoneStage(progress.current_stage ?? 1)
        setStage3Submitted(!!progress.stage3_submitted)
        setCapstoneCompleted(!!progress.completed)
        setCertificateIssued(!!progress.certificate_issued)
        setCertificateRequested(!!progress.certificate_requested)
      }
    }
    const loadCourse = async () => {
      try {
        setLoading(true)
        setMeeting(null)
        
        if (authUser) {
          const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name, name')
          .eq('clerk_id', authUser.id)
                  .maybeSingle()
            
          setUser({
            id: authUser.id,
            name: userProfile?.full_name || userProfile?.name || authUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Student'          })

          // Enrollment check
         // 🔥 STEP 1: clerk_id se UUID nikaal
const { data: profile, error: profileError } = await supabase
.from('profiles')
.select('id')
.eq('clerk_id', authUser.id)
.single()

if (profileError || !profile) {
console.error("Profile not found", profileError)
setIsEnrolled(false)
return
}

uuid = profile.id
// 🔥 STEP 2: enrollment check UUID se karo
const { data: enrollment } = await supabase
.from('course_enrollments')
.select('id')
.eq('student_id', uuid)   // ✅ FIXED
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
        if (capstoneData && uuid) {
          const { data: progress } = await supabase
            .from('student_capstone_progress')
            .select('*')
            .eq('student_id', uuid)
            .eq('capstone_id', capstoneData.id)
            .maybeSingle()
        
          setCapstoneStage(progress?.current_stage ?? 1)
          setStage3Submitted(!!progress?.stage3_submitted)
          setCapstoneCompleted(!!progress?.completed)
          setCertificateIssued(!!progress?.certificate_issued)
          setCertificateRequested(!!progress?.certificate_requested)
        
          // 🔥 REALTIME
          const channel = supabase
            .channel('capstone-progress')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'student_capstone_progress',
                filter: `student_id=eq.${uuid}`
              },
              () => {
                fetchCapstoneProgress(capstoneData.id, uuid!) // safe now
              }
            )
            .subscribe()
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
