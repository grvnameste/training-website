import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  kind: text('kind').notNull().default('institute'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('student'),
  status: text('status').notNull().default('active'),
  ...timestamps,
})

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique(),
  companyId: uuid('company_id'),
  name: text('name'),
  fullName: text('full_name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email'),
  role: text('role').notNull().default('student'),
  avatar: text('avatar'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  about: text('about'),
  projects: jsonb('projects').$type<any[]>(),
  skills: jsonb('skills').$type<any[]>(),
  resumeData: jsonb('resume_data').$type<any>(),
  ...timestamps,
})

export const companyMemberships = pgTable(
  'company_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('student'),
    status: text('status').notNull().default('active'),
    ...timestamps,
  },
  (table) => [
    unique('company_memberships_company_user_role_key').on(
      table.companyId,
      table.userId,
      table.role
    ),
    index('company_memberships_user_idx').on(table.userId),
    index('company_memberships_company_idx').on(table.companyId),
  ]
)

export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    userAgent: text('user_agent'),
    ip: text('ip'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [index('user_sessions_user_idx').on(table.userId)]
)

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id'),
    companyId: uuid('company_id'),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    description: text('description'),
    price: numeric('price'),
    thumbnailUrl: text('thumbnail_url'),
    isCapstone: boolean('is_capstone').notNull().default(false),
    parentCourseId: uuid('parent_course_id'),
    status: text('status').notNull().default('published'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    level: text('level').notNull().default('beginner'),
    estimatedMinutes: integer('estimated_minutes'),
    outcomes: jsonb('outcomes').$type<string[]>().notNull().default([]),
    prerequisites: jsonb('prerequisites').$type<string[]>().notNull().default([]),
    tags: text('tags').array().notNull().default([]),
    whatYouBuild: text('what_you_build'),
    language: text('language').notNull().default('en'),
    certificateEnabled: boolean('certificate_enabled').notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index('courses_company_status_idx').on(table.companyId, table.status),
    index('courses_teacher_idx').on(table.teacherId),
  ]
)

export const sections = pgTable(
  'sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    orderIndex: integer('order_index').notNull(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('sections_course_idx').on(table.courseId)]
)

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    duration: text('duration'),
    orderIndex: integer('order_index').notNull(),
    videoUrl: text('video_url'),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    summary: text('summary'),
    objectives: jsonb('objectives').$type<string[]>().notNull().default([]),
    estimatedMinutes: integer('estimated_minutes'),
    completionMode: text('completion_mode').notNull().default('manual'),
    isPreview: boolean('is_preview').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('lessons_section_idx').on(table.sectionId)]
)

export const courseEnrollments = pgTable(
  'course_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull(),
    companyId: uuid('company_id'),
    status: text('status').notNull().default('active'),
    studentFirstName: text('student_first_name'),
    studentLastName: text('student_last_name'),
    courseTitle: text('course_title'),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
    clerkId: text('clerk_id'),
  },
  (table) => [
    unique('course_enrollments_student_course_key').on(table.studentId, table.courseId),
    index('course_enrollments_course_idx').on(table.courseId),
  ]
)

export const entitlements = pgTable(
  'entitlements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    source: text('source').notNull().default('self'),
    status: text('status').notNull().default('active'),
    grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index('entitlements_student_course_idx').on(table.studentId, table.courseId),
    index('entitlements_company_idx').on(table.companyId),
  ]
)

export const lessonCompletions = pgTable(
  'lesson_completions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
    source: text('source').notNull().default('explicit'),
  },
  (table) => [
    unique('lesson_completions_student_lesson_key').on(table.studentId, table.lessonId),
    index('lesson_completions_student_course_idx').on(table.studentId, table.courseId),
  ]
)

export const lessonPlayback = pgTable(
  'lesson_playback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    positionSeconds: integer('position_seconds').notNull().default(0),
    durationSeconds: integer('duration_seconds'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('lesson_playback_student_lesson_key').on(table.studentId, table.lessonId)]
)

export const studentLessonProgress = pgTable(
  'student_lesson_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull(),
    lessonId: uuid('lesson_id').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('student_lesson_progress_student_course_key').on(table.studentId, table.courseId)]
)

export const studentCapstoneProgress = pgTable(
  'student_capstone_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    capstoneId: uuid('capstone_id').notNull(),
    currentStage: integer('current_stage').notNull().default(1),
    isApproved: boolean('is_approved').notNull().default(false),
    requirementUploaded: boolean('requirement_uploaded').notNull().default(false),
    submittedForReview: boolean('submitted_for_review').notNull().default(false),
    stage1Submitted: boolean('stage1_submitted').notNull().default(false),
    stage1Approved: boolean('stage1_approved').notNull().default(false),
    stage2Submitted: boolean('stage2_submitted').notNull().default(false),
    stage2Approved: boolean('stage2_approved').notNull().default(false),
    stage3Submitted: boolean('stage3_submitted').notNull().default(false),
    stage3Approved: boolean('stage3_approved').notNull().default(false),
    certificateRequested: boolean('certificate_requested').notNull().default(false),
    certificateIssued: boolean('certificate_issued').notNull().default(false),
    completed: boolean('completed').notNull().default(false),
  },
  (table) => [
    unique('student_capstone_progress_student_capstone_key').on(
      table.studentId,
      table.capstoneId
    ),
  ]
)

export const requirementDocuments = pgTable(
  'requirement_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id').references(() => profiles.id, { onDelete: 'cascade' }),
    capstoneId: uuid('capstone_id').notNull(),
    fileUrl: text('file_url'),
    approved: boolean('approved').notNull().default(false),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('requirement_documents_student_capstone_key').on(table.studentId, table.capstoneId)]
)

export const stage2Submissions = pgTable('stage2_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => profiles.id, { onDelete: 'cascade' }),
  capstoneId: uuid('capstone_id').notNull(),
  boardId: uuid('board_id'),
  boardData: jsonb('board_data').$type<any>(),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
})

export const stage3Submissions = pgTable('stage3_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  capstoneId: uuid('capstone_id').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type'),
  fileUrl: text('file_url').notNull(),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
})

export const capstoneMeetings = pgTable(
  'capstone_meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id').references(() => profiles.id, { onDelete: 'cascade' }),
    capstoneId: uuid('capstone_id').notNull(),
    meetingLink: text('meeting_link').notNull(),
    meetingDate: date('meeting_date').notNull(),
    meetingTime: text('meeting_time').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('capstone_meetings_student_capstone_key').on(table.studentId, table.capstoneId)]
)

export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull(),
    studentName: text('student_name').notNull(),
    courseName: text('course_name').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: false }).notNull().defaultNow(),
  },
  (table) => [unique('certificates_student_course_key').on(table.studentId, table.courseId)]
)

export const chatRooms = pgTable(
  'chat_rooms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('chat_rooms_student_course_key').on(table.studentId, table.courseId)]
)

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id')
    .notNull()
    .references(() => chatRooms.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull(),
  content: text('content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const quizSubmissions = pgTable('quiz_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').notNull(),
  quizTitle: text('quiz_title').notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  percentage: integer('percentage').notNull(),
  passed: boolean('passed').notNull().default(false),
  timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
  answers: jsonb('answers').$type<any>(),
  feedback: jsonb('feedback').$type<any>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const questionnaireResults = pgTable('questionnaire_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  careerAnswers: jsonb('career_answers').$type<any>(),
  careerOpenAnswers: jsonb('career_open_answers').$type<any>(),
  cultureAnswers: jsonb('culture_answers').$type<any>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const studentActivity = pgTable('student_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const boards = pgTable(
  'boards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    capstoneId: uuid('capstone_id').notNull(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
  },
  (table) => [unique('boards_student_capstone_key').on(table.studentId, table.capstoneId)]
)

export const lists = pgTable('lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').references(() => boards.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
})

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  listId: uuid('list_id').references(() => lists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').notNull().default(0),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
})

export const boardTemplates = pgTable('board_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  capstoneId: uuid('capstone_id'),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
})

export const templateLists = pgTable('template_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => boardTemplates.id, { onDelete: 'cascade' }),
  title: text('title'),
  position: integer('position'),
})

export const templateCards = pgTable('template_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  listId: uuid('list_id').references(() => templateLists.id, { onDelete: 'cascade' }),
  title: text('title'),
  position: integer('position'),
})

export const lessonBlocks = pgTable(
  'lesson_blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    position: integer('position').notNull(),
    content: jsonb('content').$type<Record<string, any>>().notNull().default({}),
    ...timestamps,
  },
  (table) => [index('lesson_blocks_lesson_position_idx').on(table.lessonId, table.position)]
)

export const lessonResources = pgTable('lesson_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  kind: text('kind').notNull().default('download'),
  storagePath: text('storage_path'),
  externalUrl: text('external_url'),
  fileName: text('file_name'),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const lessonTranscripts = pgTable('lesson_transcripts', {
  lessonId: uuid('lesson_id')
    .primaryKey()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  language: text('language').notNull().default('en'),
  fullText: text('full_text').notNull(),
  segments: jsonb('segments').$type<any[]>().notNull().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const lessonNotes = pgTable(
  'lesson_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    content: text('content').notNull().default(''),
    ...timestamps,
  },
  (table) => [unique('lesson_notes_student_lesson_key').on(table.studentId, table.lessonId)]
)

export const studentPreferences = pgTable('student_preferences', {
  studentId: uuid('student_id')
    .primaryKey()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  goal: text('goal'),
  level: text('level'),
  weeklyMinutes: integer('weekly_minutes'),
  preferredTopics: text('preferred_topics').array().notNull().default([]),
  onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
  ...timestamps,
})

export const assignments = pgTable(
  'assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    instructions: text('instructions').notNull(),
    dueAt: timestamp('due_at', { withTimezone: true }),
    submissionTypes: text('submission_types').array().notNull().default(['text']),
    maxAttempts: integer('max_attempts').notNull().default(1),
    isRequired: boolean('is_required').notNull().default(true),
    status: text('status').notNull().default('draft'),
    ...timestamps,
  },
  (table) => [
    index('assignments_course_status_idx').on(table.courseId, table.status),
    index('assignments_due_idx').on(table.dueAt),
  ]
)

export const rubrics = pgTable('rubrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignmentId: uuid('assignment_id')
    .notNull()
    .unique()
    .references(() => assignments.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Evaluation rubric'),
  ...timestamps,
})

export const rubricCriteria = pgTable(
  'rubric_criteria',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    rubricId: uuid('rubric_id')
      .notNull()
      .references(() => rubrics.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    maxPoints: integer('max_points').notNull(),
    position: integer('position').notNull().default(0),
  },
  (table) => [index('rubric_criteria_rubric_position_idx').on(table.rubricId, table.position)]
)

export const assignmentSubmissions = pgTable(
  'assignment_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assignmentId: uuid('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    attempt: integer('attempt').notNull().default(1),
    status: text('status').notNull().default('submitted'),
    content: text('content'),
    repoUrl: text('repo_url'),
    linkUrl: text('link_url'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    unique('assignment_submissions_attempt_key').on(
      table.assignmentId,
      table.studentId,
      table.attempt
    ),
    index('assignment_submissions_assignment_status_idx').on(
      table.assignmentId,
      table.status
    ),
  ]
)

export const submissionFiles = pgTable(
  'submission_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => assignmentSubmissions.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('submission_files_submission_idx').on(table.submissionId)]
)

export const assignmentReviews = pgTable(
  'assignment_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => assignmentSubmissions.id, { onDelete: 'cascade' }),
    reviewerId: uuid('reviewer_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    decision: text('decision').notNull(),
    overallFeedback: text('overall_feedback'),
    totalScore: integer('total_score'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('assignment_reviews_submission_idx').on(table.submissionId)]
)

export const reviewScores = pgTable(
  'review_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reviewId: uuid('review_id')
      .notNull()
      .references(() => assignmentReviews.id, { onDelete: 'cascade' }),
    criterionId: uuid('criterion_id')
      .notNull()
      .references(() => rubricCriteria.id, { onDelete: 'cascade' }),
    points: integer('points').notNull(),
    comment: text('comment'),
  },
  (table) => [unique('review_scores_review_criterion_key').on(table.reviewId, table.criterionId)]
)

export const projectTemplates = pgTable(
  'project_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('draft'),
    ...timestamps,
  },
  (table) => [
    index('project_templates_course_status_idx').on(table.courseId, table.status),
  ]
)

export const projectPhases = pgTable(
  'project_phases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => projectTemplates.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    index('project_phases_template_position_idx').on(table.templateId, table.position),
  ]
)

export const projectMilestones = pgTable(
  'project_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phaseId: uuid('phase_id')
      .notNull()
      .references(() => projectPhases.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    acceptanceCriteria: text('acceptance_criteria'),
    estimatedHours: integer('estimated_hours'),
    dueOffsetDays: integer('due_offset_days'),
    isRequired: boolean('is_required').notNull().default(true),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    index('project_milestones_phase_position_idx').on(table.phaseId, table.position),
  ]
)

export const projectInstances = pgTable(
  'project_instances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => projectTemplates.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('active'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    unique('project_instances_template_student_key').on(table.templateId, table.studentId),
    index('project_instances_student_idx').on(table.studentId, table.status),
  ]
)

export const projectInstanceMilestones = pgTable(
  'project_instance_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    instanceId: uuid('instance_id')
      .notNull()
      .references(() => projectInstances.id, { onDelete: 'cascade' }),
    milestoneId: uuid('milestone_id')
      .notNull()
      .references(() => projectMilestones.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('locked'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  },
  (table) => [
    unique('project_instance_milestones_instance_milestone_key').on(
      table.instanceId,
      table.milestoneId
    ),
    index('project_instance_milestones_instance_status_idx').on(
      table.instanceId,
      table.status
    ),
  ]
)

export const projectMilestoneSubmissions = pgTable(
  'project_milestone_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    instanceMilestoneId: uuid('instance_milestone_id')
      .notNull()
      .references(() => projectInstanceMilestones.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    attempt: integer('attempt').notNull().default(1),
    content: text('content'),
    repoUrl: text('repo_url'),
    linkUrl: text('link_url'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    reviewerId: uuid('reviewer_id').references(() => profiles.id, { onDelete: 'set null' }),
    decision: text('decision'),
    feedback: text('feedback'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  },
  (table) => [
    unique('project_milestone_submissions_attempt_key').on(
      table.instanceMilestoneId,
      table.attempt
    ),
  ]
)

export const projectMilestoneFiles = pgTable(
  'project_milestone_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => projectMilestoneSubmissions.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('project_milestone_files_submission_idx').on(table.submissionId),
  ]
)

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    linkUrl: text('link_url'),
    metadata: jsonb('metadata').$type<Record<string, any>>().notNull().default({}),
    dedupeKey: text('dedupe_key'),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notifications_profile_created_idx').on(table.profileId, table.createdAt),
    index('notifications_profile_unread_idx')
      .on(table.profileId)
      .where(sql`${table.readAt} is null`),
    uniqueIndex('notifications_profile_dedupe_key')
      .on(table.profileId, table.dedupeKey)
      .where(sql`${table.dedupeKey} is not null`),
  ]
)

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    actorProfileId: uuid('actor_profile_id').references(() => profiles.id, { onDelete: 'set null' }),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    metadata: jsonb('metadata').$type<Record<string, any>>().notNull().default({}),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('audit_logs_resource_idx').on(table.resourceType, table.resourceId)]
)

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  memberships: many(companyMemberships),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
  company: one(companies, { fields: [profiles.companyId], references: [companies.id] }),
}))

export const companiesRelations = relations(companies, ({ many }) => ({
  memberships: many(companyMemberships),
}))

export const coursesRelations = relations(courses, ({ many, one }) => ({
  sections: many(sections),
  company: one(companies, { fields: [courses.companyId], references: [companies.id] }),
}))

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, { fields: [sections.courseId], references: [courses.id] }),
  lessons: many(lessons),
}))

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, { fields: [lessons.sectionId], references: [sections.id] }),
  blocks: many(lessonBlocks),
}))
