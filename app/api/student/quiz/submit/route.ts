// app/api/student/quiz/submit/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth/server'
import { generateQuizFeedback, getQuizQuestions } from '@/lib/quiz/quizData'

const getSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdiafdknsvbutdrkobwi.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { context } = authResult
    const { searchParams } = new URL(req.url)
    const quizId = searchParams.get('quizId')

    const supabaseAdmin = getSupabaseAdmin()
    let query = supabaseAdmin
      .from('quiz_submissions')
      .select('id, quiz_id, quiz_title, score, total_questions, percentage, passed, time_spent_seconds, created_at')
      .eq('student_id', context.profile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (quizId) {
      query = query.eq('quiz_id', quizId)
    }

    const { data, error } = await query

    if (error) {
      // Gracefully return empty attempts if quiz_submissions table isn't provisioned yet
      return NextResponse.json({ attempts: [] })
    }

    const attempts = (data || []).map((row: any) => ({
      id: row.id,
      quizId: row.quiz_id,
      quizTitle: row.quiz_title,
      score: row.score,
      totalQuestions: row.total_questions,
      percentage: row.percentage,
      passed: row.passed,
      timeSpentSeconds: row.time_spent_seconds,
      completedAt: row.created_at,
    }))

    return NextResponse.json({ attempts })
  } catch (error: any) {
    console.error('Quiz history fetch error:', error)
    return NextResponse.json({ attempts: [] })
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { context } = authResult
    const body = await req.json()
    const {
      quizId,
      quizTitle,
      answers,
      timeSpentSeconds = 0,
    } = body

    if (!quizId) {
      return NextResponse.json({ error: 'Missing required parameter: quizId' }, { status: 400 })
    }

    const questions = getQuizQuestions(quizId)
    const feedback = generateQuizFeedback(questions, answers || {})
    const supabaseAdmin = getSupabaseAdmin()

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // 1. Try persisting in quiz_submissions if table exists
    try {
      await supabaseAdmin.from('quiz_submissions').insert({
        student_id: context.profile.id,
        quiz_id: quizId,
        quiz_title: quizTitle || quizId,
        score: feedback.overallScore,
        total_questions: questions.length,
        percentage: feedback.percentage,
        passed: feedback.passed,
        time_spent_seconds: timeSpentSeconds,
        answers: answers || {},
        feedback: feedback,
      })
    } catch (dbErr) {
      console.warn('Could not write to quiz_submissions table:', dbErr)
    }

    // 2. Persist in student_activity for streak and history timeline
    try {
      await supabaseAdmin.from('student_activity').insert({
        student_id: context.profile.id,
        type: 'QUIZ_COMPLETED',
      })
    } catch (actErr) {
      console.warn('Could not record student_activity:', actErr)
    }

    return NextResponse.json({
      success: true,
      submissionId,
      feedback,
      studentId: context.profile.id,
      savedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit and score quiz' },
      { status: 500 }
    )
  }
}
