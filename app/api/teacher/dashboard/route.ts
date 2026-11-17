// app/api/teacher/dashboard/route.ts
import { and, eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole } from '@/lib/auth/server'
import { db } from '@/lib/db'
import {
  projectInstanceMilestones,
  projectInstances,
  projectTemplates,
} from '@/lib/db/schema'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLastSixMonthBuckets() {
  const now = new Date()
  const buckets: { key: string; label: string; enrollments: number; quizzes: number; capstones: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.push({
      key,
      label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      enrollments: 0,
      quizzes: 0,
      capstones: 0,
    })
  }
  return buckets
}

export async function GET(req: Request) {
  const authResult = await requireRole(['teacher', 'super_admin'])
  if (!authResult.success) {
    return authResult.response
  }

  const { context } = authResult
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') === 'mine' ? 'mine' : 'all'
  const queryTeacherId = searchParams.get('teacherId')

  const teacherId =
    context.role === 'super_admin' && queryTeacherId
      ? queryTeacherId
      : context.profile.id

  if (!teacherId) {
    return NextResponse.json(
      { error: 'Teacher profile ID not resolved' },
      { status: 400 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdiafdknsvbutdrkobwi.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )

  try {
    // 1. Fetch courses (super_admin can toggle 'all' vs 'mine'; teachers see their own)
    let coursesQuery = supabase
      .from('courses')
      .select('id, teacher_id, title, subtitle, description, price, thumbnail_url, is_capstone, parent_course_id, created_at')
      .order('created_at', { ascending: false })

    if (context.role !== 'super_admin' || scope === 'mine') {
      coursesQuery = coursesQuery.eq('teacher_id', teacherId)
    }

    const { data: rawCourses, error: coursesError } = await coursesQuery

    if (coursesError) {
      console.error('Dashboard courses query error:', coursesError)
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }

    const allCourses = rawCourses || []
    const standardCourses = allCourses.filter((c) => !c.is_capstone)
    const capstoneCourses = allCourses.filter((c) => c.is_capstone)
    const allCourseIds = allCourses.map((c) => c.id)
    const capstoneIds = capstoneCourses.map((c) => c.id)

    // Map parent_course_id -> capstone course
    const capstoneByParent = new Map<string, (typeof capstoneCourses)[0]>()
    for (const cap of capstoneCourses) {
      if (cap.parent_course_id) {
        capstoneByParent.set(cap.parent_course_id, cap)
      }
    }

    // 2. Fetch enrollments, capstone progress, meetings, certificates, and quizzes in parallel
    const [enrollmentsRes, progressRes, meetingsRes, certificatesRes, quizzesRes] = await Promise.all([
      allCourseIds.length > 0
        ? supabase
            .from('course_enrollments')
            .select('id, student_id, course_id, enrolled_at')
            .in('course_id', allCourseIds)
        : Promise.resolve({ data: [], error: null }),
      capstoneIds.length > 0
        ? supabase
            .from('student_capstone_progress')
            .select('*')
            .in('capstone_id', capstoneIds)
        : Promise.resolve({ data: [], error: null }),
      capstoneIds.length > 0
        ? supabase
            .from('capstone_meetings')
            .select('id, student_id, capstone_id, meeting_link, meeting_date, meeting_time, notes, created_at')
            .in('capstone_id', capstoneIds)
            .order('meeting_date', { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      allCourseIds.length > 0
        ? supabase
            .from('certificates')
            .select('id, student_id, course_id, issued_at')
            .in('course_id', allCourseIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('quiz_submissions')
        .select('id, student_id, quiz_id, quiz_title, percentage, passed, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    const enrollments = enrollmentsRes.data || []
    const progressRows = progressRes.data || []
    const meetings = meetingsRes.data || []
    const certificates = certificatesRes.data || []
    const quizzes = quizzesRes.data || []

    // 3. Collect unique student IDs to resolve profile names & emails
    const studentIdsSet = new Set<string>()
    enrollments.forEach((e: any) => e.student_id && studentIdsSet.add(e.student_id))
    progressRows.forEach((p: any) => p.student_id && studentIdsSet.add(p.student_id))
    meetings.forEach((m: any) => m.student_id && studentIdsSet.add(m.student_id))
    quizzes.forEach((q: any) => q.student_id && studentIdsSet.add(q.student_id))

    const studentIds = Array.from(studentIdsSet)
    const studentMap = new Map<string, { id: string; name: string; email: string; avatar: string | null }>()

    if (studentIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, full_name, email, avatar_url')
        .in('id', studentIds)

      for (const p of profiles || []) {
        studentMap.set(p.id, {
          id: p.id,
          name: p.name || p.full_name || 'Student',
          email: p.email || '',
          avatar: p.avatar_url || null,
        })
      }
    }

    // 4. Compute enrollment counts per course
    const enrollmentsPerCourse = new Map<string, number>()
    const uniqueStudentIdsFromEnrollments = new Set<string>()
    for (const e of enrollments) {
      uniqueStudentIdsFromEnrollments.add(e.student_id)
      enrollmentsPerCourse.set(e.course_id, (enrollmentsPerCourse.get(e.course_id) || 0) + 1)
    }

    // 5. Capstone pipeline metrics & pending reviews
    let stage1Pending = 0
    let stage2Pending = 0
    let stage3Pending = 0
    let completedCount = 0
    let certificatesPending = 0
    let certificatesIssuedCount = certificates.length

    for (const p of progressRows) {
      if (p.stage1_submitted && !p.stage1_approved) stage1Pending++
      if (p.stage2_submitted && !p.stage2_approved) stage2Pending++
      if (p.stage3_submitted && !p.stage3_approved) stage3Pending++
      if (p.completed) completedCount++
      if (p.certificate_requested && !p.certificate_issued && p.stage3_submitted) {
        certificatesPending++
      }
      if (p.certificate_issued && certificates.length === 0) {
        certificatesIssuedCount++
      }
    }

    const pendingApprovals = stage1Pending + stage2Pending + stage3Pending
    const totalCapstoneParticipants = progressRows.length
    const completionRate =
      totalCapstoneParticipants > 0
        ? Math.round((completedCount / totalCapstoneParticipants) * 100)
        : 0

    // Average quiz score
    const avgQuizScore =
      quizzes.length > 0
        ? Math.round(quizzes.reduce((sum: number, q: any) => sum + (Number(q.percentage) || 0), 0) / quizzes.length)
        : 0

    // 6. Build 6-month activity chart buckets
    const activitySeries = getLastSixMonthBuckets()
    const bucketMap = new Map(activitySeries.map((b) => [b.key, b]))

    for (const e of enrollments) {
      if (!e.enrolled_at) continue
      const d = new Date(e.enrolled_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const bucket = bucketMap.get(key)
      if (bucket) bucket.enrollments++
    }

    for (const q of quizzes) {
      if (!q.created_at) continue
      const d = new Date(q.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const bucket = bucketMap.get(key)
      if (bucket) bucket.quizzes++
    }

    for (const p of progressRows) {
      const ts = p.created_at || null
      if (!ts) continue
      const d = new Date(ts)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const bucket = bucketMap.get(key)
      if (bucket) bucket.capstones++
    }

    // 7. Quiz averages per student
    const studentQuizTotals = new Map<string, { sum: number; count: number }>()
    for (const q of quizzes) {
      if (!q.student_id) continue
      const entry = studentQuizTotals.get(q.student_id) || { sum: 0, count: 0 }
      entry.sum += Number(q.percentage) || 0
      entry.count += 1
      studentQuizTotals.set(q.student_id, entry)
    }

    // 8. Build Student Progress Table rows (merging capstone progress & enrollments)
    const courseById = new Map(allCourses.map((c) => [c.id, c]))
    const studentProgressList: {
      id: string
      studentId: string
      studentName: string
      studentEmail: string
      courseId: string
      courseTitle: string
      capstoneId: string | null
      currentStage: number
      progressPercent: number
      statusLabel: string
      needsReview: boolean
      quizAverage: number | null
      updatedAt: string
    }[] = []

    const coveredStudentCourseKeys = new Set<string>()

    for (const p of progressRows) {
      const capCourse = courseById.get(p.capstone_id)
      const student = studentMap.get(p.student_id)
      const qStats = studentQuizTotals.get(p.student_id)
      const quizAverage = qStats ? Math.round(qStats.sum / qStats.count) : null

      const needsReview =
        (p.stage1_submitted && !p.stage1_approved) ||
        (p.stage2_submitted && !p.stage2_approved) ||
        (p.stage3_submitted && !p.stage3_approved)

      let progressPercent = 15
      if (p.completed || p.certificate_issued) progressPercent = 100
      else if (p.stage3_approved) progressPercent = 90
      else if (p.stage3_submitted) progressPercent = 75
      else if (p.stage2_approved) progressPercent = 65
      else if (p.stage2_submitted) progressPercent = 50
      else if (p.stage1_approved) progressPercent = 35
      else if (p.stage1_submitted) progressPercent = 25

      const statusLabel = p.completed
        ? 'Completed'
        : needsReview
        ? `Stage ${p.current_stage} Pending Review`
        : `Stage ${p.current_stage || 1} of 3`

      coveredStudentCourseKeys.add(`${p.student_id}:${p.capstone_id}`)
      if (capCourse?.parent_course_id) {
        coveredStudentCourseKeys.add(`${p.student_id}:${capCourse.parent_course_id}`)
      }

      studentProgressList.push({
        id: p.id,
        studentId: p.student_id,
        studentName: student?.name || 'Student',
        studentEmail: student?.email || '',
        courseId: capCourse?.parent_course_id || p.capstone_id,
        courseTitle: capCourse?.title || 'Capstone Track',
        capstoneId: p.capstone_id,
        currentStage: p.current_stage || 1,
        progressPercent,
        statusLabel,
        needsReview,
        quizAverage,
        updatedAt: new Date().toISOString(),
      })
    }

    // Add remaining course enrollments that do not yet have a capstone progress row
    for (const e of enrollments) {
      const key = `${e.student_id}:${e.course_id}`
      if (coveredStudentCourseKeys.has(key)) continue
      const course = courseById.get(e.course_id)
      if (!course || course.is_capstone) continue
      const student = studentMap.get(e.student_id)
      const qStats = studentQuizTotals.get(e.student_id)
      const quizAverage = qStats ? Math.round(qStats.sum / qStats.count) : null
      const linkedCapstone = capstoneByParent.get(course.id)

      studentProgressList.push({
        id: e.id,
        studentId: e.student_id,
        studentName: student?.name || 'Student',
        studentEmail: student?.email || '',
        courseId: course.id,
        courseTitle: course.title,
        capstoneId: linkedCapstone?.id || null,
        currentStage: 0,
        progressPercent: quizAverage !== null ? Math.min(85, Math.max(20, quizAverage)) : 15,
        statusLabel: 'Enrolled',
        needsReview: false,
        quizAverage,
        updatedAt: e.enrolled_at || new Date().toISOString(),
      })
    }

    studentProgressList.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    // 9. Project delivery metrics
    let projectMetrics = {
      templates: 0,
      publishedTemplates: 0,
      activeInstances: 0,
      completedInstances: 0,
      pendingReviews: 0,
    }

    if (allCourseIds.length > 0) {
      const [templates, instances, pendingMilestones] = await Promise.all([
        db
          .select({ id: projectTemplates.id, status: projectTemplates.status })
          .from(projectTemplates)
          .where(inArray(projectTemplates.courseId, allCourseIds)),
        db
          .select({ id: projectInstances.id, status: projectInstances.status })
          .from(projectInstances)
          .where(inArray(projectInstances.courseId, allCourseIds)),
        db
          .select({ id: projectInstanceMilestones.id })
          .from(projectInstanceMilestones)
          .innerJoin(
            projectInstances,
            eq(projectInstances.id, projectInstanceMilestones.instanceId)
          )
          .where(
            and(
              inArray(projectInstances.courseId, allCourseIds),
              eq(projectInstanceMilestones.status, 'submitted')
            )
          ),
      ])

      projectMetrics = {
        templates: templates.length,
        publishedTemplates: templates.filter((template) => template.status === 'published')
          .length,
        activeInstances: instances.filter((instance) => instance.status === 'active').length,
        completedInstances: instances.filter((instance) => instance.status === 'completed')
          .length,
        pendingReviews: pendingMilestones.length,
      }
    }

    const projectNextAction =
      projectMetrics.pendingReviews > 0
        ? {
            label: `Review ${projectMetrics.pendingReviews} project milestone${
              projectMetrics.pendingReviews === 1 ? '' : 's'
            }`,
            href: '/teacher/project-reviews',
            tone: 'warning' as const,
          }
        : projectMetrics.activeInstances > 0
        ? {
            label: 'Monitor active student projects',
            href: '/teacher/courses',
            tone: 'info' as const,
          }
        : projectMetrics.templates > 0
        ? {
            label: 'Publish a project template',
            href: '/teacher/courses',
            tone: 'info' as const,
          }
        : {
            label: 'Create a project template',
            href: '/teacher/courses',
            tone: 'info' as const,
          }

    // 10. Enriched Courses payload
    const enrichedCourses = standardCourses.map((c) => {
      const linkedCapstone = capstoneByParent.get(c.id)
      const enrolledCount = enrollmentsPerCourse.get(c.id) || 0
      return {
        id: c.id,
        title: c.title,
        subtitle: c.subtitle || '',
        description: c.description || '',
        price: c.price || 0,
        thumbnail_url: c.thumbnail_url || null,
        created_at: c.created_at,
        enrolledCount,
        hasCapstone: Boolean(linkedCapstone),
        capstoneId: linkedCapstone?.id || null,
      }
    })

    // 11. Upcoming mentor sessions
    const upcomingMeetings = meetings.slice(0, 8).map((m: any) => {      const student = studentMap.get(m.student_id)
      const capCourse = courseById.get(m.capstone_id)
      return {
        id: m.id,
        studentId: m.student_id,
        studentName: student?.name || 'Student',
        capstoneId: m.capstone_id,
        capstoneTitle: capCourse?.title || 'Capstone Review',
        meetingLink: m.meeting_link,
        meetingDate: m.meeting_date,
        meetingTime: m.meeting_time,
        notes: m.notes,
        scheduledAt: m.meeting_date
          ? `${m.meeting_date}T${m.meeting_time || '00:00'}`
          : m.created_at,
      }
    })

    return NextResponse.json({
      role: context.role,
      scope: context.role === 'super_admin' ? scope : 'mine',
      summary: {
        totalCourses: standardCourses.length,
        capstoneCourses: capstoneCourses.length,
        totalStudents: uniqueStudentIdsFromEnrollments.size,
        totalEnrollments: enrollments.length,
        pendingApprovals,
        pendingCertificates: certificatesPending,
        issuedCertificates: certificatesIssuedCount,
        avgQuizScore,
        completionRate,
      },
      capstonePipeline: {
        total: totalCapstoneParticipants,
        stage1Pending,
        stage2Pending,
        stage3Pending,
        completed: completedCount,
        certificatesPending,
        certificatesIssued: certificatesIssuedCount,
      },
      activitySeries,
      courses: enrichedCourses,
      studentProgress: studentProgressList.slice(0, 25),
      upcomingMeetings,
      projects: {
        ...projectMetrics,
        nextAction: projectNextAction,
      },
    })
  } catch (err: any) {
    console.error('Teacher dashboard aggregation error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to load dashboard analytics' },
      { status: 500 }
    )
  }
}
