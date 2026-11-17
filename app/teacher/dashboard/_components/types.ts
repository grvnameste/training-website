export interface DashboardSummary {
  totalCourses: number
  capstoneCourses: number
  totalStudents: number
  totalEnrollments: number
  pendingApprovals: number
  pendingCertificates: number
  issuedCertificates: number
  avgQuizScore: number
  completionRate: number
}

export interface CapstonePipeline {
  total: number
  stage1Pending: number
  stage2Pending: number
  stage3Pending: number
  completed: number
  certificatesPending: number
  certificatesIssued: number
}

export interface ActivityPoint {
  key: string
  label: string
  enrollments: number
  quizzes: number
  capstones: number
}

export interface DashboardCourse {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  thumbnail_url: string | null
  created_at: string
  enrolledCount: number
  hasCapstone: boolean
  capstoneId: string | null
}

export interface StudentProgressItem {
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
}

export interface UpcomingMeeting {
  id: string
  studentId: string
  studentName: string
  capstoneId: string
  capstoneTitle: string
  meetingLink: string
  scheduledAt: string
}

export interface ProjectMetrics {
  templates: number
  publishedTemplates: number
  activeInstances: number
  completedInstances: number
  pendingReviews: number
  nextAction: {
    label: string
    href: string
    tone: 'warning' | 'info'
  }
}

export interface TeacherDashboardPayload {
  role: string
  scope: 'all' | 'mine'
  summary: DashboardSummary
  capstonePipeline: CapstonePipeline
  activitySeries: ActivityPoint[]
  courses: DashboardCourse[]
  studentProgress: StudentProgressItem[]
  upcomingMeetings: UpcomingMeeting[]
  projects: ProjectMetrics
}
