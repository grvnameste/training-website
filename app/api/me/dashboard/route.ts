import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { questionnaireResults } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { toErrorResponse } from '@/lib/http/errors'
import {
  getEnrolledCoursesWithProgress,
  getOrderedCourseLessons,
} from '@/lib/services/progress-service'
import { getRecommendations } from '@/lib/services/onboarding-service'
import { listStudentAssignments } from '@/lib/services/assignment-service'
import { listStudentProjects } from '@/lib/services/project-service'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { context } = authResult
    const courses = await getEnrolledCoursesWithProgress(context.profile.id)

    let continueLearning: {
      courseId: string
      courseTitle: string
      lessonId: string
      lessonTitle: string
      positionSeconds: number
      percentage: number
    } | null = null

    for (const course of courses) {
      if (!course.progress.resumeLessonId || course.progress.percentage >= 100) continue
      const lessons = await getOrderedCourseLessons(course.courseId)
      const lesson = lessons.find((item) => item.id === course.progress.resumeLessonId)
      if (!lesson) continue
      continueLearning = {
        courseId: course.courseId,
        courseTitle: course.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        positionSeconds: course.progress.resumePositionSeconds,
        percentage: course.progress.percentage,
      }
      break
    }

    const [questionnaire, onboarding, assignmentRows, projectBoard] = await Promise.all([
      db
        .select({ id: questionnaireResults.id })
        .from(questionnaireResults)
        .where(eq(questionnaireResults.userId, context.profile.id))
        .limit(1),
      getRecommendations(context),
      listStudentAssignments(context),
      listStudentProjects(context),
    ])

    const pendingAssignments = assignmentRows.filter(
      (assignment) =>
        !assignment.latestSubmission ||
        assignment.latestSubmission.status === 'changes_requested'
    )
    const overdueAssignments = assignmentRows.filter(
      (assignment) => assignment.isOverdue
    )

    const activeProjects = projectBoard.projects.filter(
      (project) => project.status === 'active'
    )
    const completedProjects = projectBoard.projects.filter(
      (project) => project.status === 'completed'
    )
    const nextProject = activeProjects.find(
      (project) => project.currentMilestoneId !== null
    )
    const projectDueSoon = activeProjects.reduce(
      (sum, project) => sum + project.dueSoonMilestones,
      0
    )
    const projectOverdue = activeProjects.reduce(
      (sum, project) => sum + project.overdueMilestones,
      0
    )

    const nextActions: {
      kind: 'assignment' | 'project'
      label: string
      detail: string
      href: string
      tone: 'danger' | 'warning' | 'info'
    }[] = []

    if (overdueAssignments.length > 0) {
      nextActions.push({
        kind: 'assignment',
        label: 'Submit overdue assignments',
        detail: `${overdueAssignments.length} assignment${
          overdueAssignments.length === 1 ? '' : 's'
        } past due`,
        href: '/student/assignments',
        tone: 'danger',
      })
    } else if (pendingAssignments.length > 0) {
      nextActions.push({
        kind: 'assignment',
        label: 'Continue assignments',
        detail: `${pendingAssignments.length} assignment${
          pendingAssignments.length === 1 ? '' : 's'
        } waiting for you`,
        href: '/student/assignments',
        tone: 'warning',
      })
    }

    if (nextProject) {
      nextActions.push({
        kind: 'project',
        label: `Continue ${nextProject.templateTitle}`,
        detail: nextProject.currentMilestoneTitle
          ? `Next milestone: ${nextProject.currentMilestoneTitle}`
          : 'Open your project workspace',
        href: `/student/projects/${nextProject.id}`,
        tone: projectOverdue > 0 ? 'danger' : 'info',
      })
    } else if (projectBoard.available.length > 0) {
      nextActions.push({
        kind: 'project',
        label: 'Start a project',
        detail: `${projectBoard.available.length} published project${
          projectBoard.available.length === 1 ? '' : 's'
        } available`,
        href: '/student/projects',
        tone: 'info',
      })
    }

    return NextResponse.json({
      continueLearning,
      courses,
      onboardingCompleted: Boolean(
        questionnaire.length > 0 || onboarding.preferences?.onboardingCompletedAt
      ),
      preferences: onboarding.preferences,
      recommendations: onboarding.recommendations,
      assignments: assignmentRows.slice(0, 10),
      assignmentCounts: {
        total: assignmentRows.length,
        pending: pendingAssignments.length,
        overdue: overdueAssignments.length,
      },
      projects: projectBoard.projects.slice(0, 5),
      availableProjects: projectBoard.available.length,
      projectCounts: {
        total: projectBoard.projects.length,
        active: activeProjects.length,
        completed: completedProjects.length,
        available: projectBoard.available.length,
        dueSoonMilestones: projectDueSoon,
        overdueMilestones: projectOverdue,
      },
      nextActions,
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
