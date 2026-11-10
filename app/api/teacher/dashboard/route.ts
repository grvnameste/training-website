// app/api/teacher/dashboard/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { searchParams } = new URL(req.url)
  const teacherId = searchParams.get('teacherId')

  if (!teacherId) {
    return NextResponse.json(
      { error: 'Teacher ID missing' },
      { status: 400 }
    )
  }

  // Teacher courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('teacher_id', teacherId)

  const courseIds = courses?.map(c => c.id) ?? []

  // Enrollments
  const { count } = await supabase
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .in('course_id', courseIds)

  // Unique students
  const { data: students } = await supabase
    .from('course_enrollments')
    .select('student_id')
    .in('course_id', courseIds)

  const uniqueStudents = new Set(students?.map(s => s.student_id))

  return NextResponse.json({
    totalCourses: courseIds.length,
    totalEnrollments: count ?? 0,
    totalStudents: uniqueStudents.size,
  })
}
