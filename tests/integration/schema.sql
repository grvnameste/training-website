-- Isolated schema for Phase 3 integration tests.
-- Mirrors the tables touched by the assignment, project, notification, and
-- certificate services so tests can run without the legacy migration chain.

create table if not exists "companies" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "slug" text not null unique,
  "kind" text not null default 'institute',
  "status" text not null default 'active',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "users" (
  "id" uuid primary key default gen_random_uuid(),
  "username" text not null unique,
  "email" text not null unique,
  "password_hash" text not null,
  "role" text not null default 'student',
  "status" text not null default 'active',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "profiles" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid unique references "users"("id") on delete cascade,
  "company_id" uuid,
  "name" text,
  "full_name" text,
  "first_name" text,
  "last_name" text,
  "email" text,
  "role" text not null default 'student',
  "avatar" text,
  "avatar_url" text,
  "phone" text,
  "about" text,
  "projects" jsonb,
  "skills" jsonb,
  "resume_data" jsonb,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "company_memberships" (
  "id" uuid primary key default gen_random_uuid(),
  "company_id" uuid not null references "companies"("id") on delete cascade,
  "user_id" uuid not null references "users"("id") on delete cascade,
  "role" text not null default 'student',
  "status" text not null default 'active',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("company_id", "user_id", "role")
);

create table if not exists "user_sessions" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "token_hash" text not null unique,
  "user_agent" text,
  "ip" text,
  "created_at" timestamptz not null default now(),
  "last_seen_at" timestamptz not null default now(),
  "expires_at" timestamptz not null,
  "revoked_at" timestamptz
);

create table if not exists "courses" (
  "id" uuid primary key default gen_random_uuid(),
  "teacher_id" uuid,
  "company_id" uuid,
  "title" text not null,
  "subtitle" text,
  "description" text,
  "price" numeric,
  "thumbnail_url" text,
  "is_capstone" boolean not null default false,
  "parent_course_id" uuid,
  "status" text not null default 'published',
  "published_at" timestamptz,
  "level" text not null default 'beginner',
  "estimated_minutes" integer,
  "outcomes" jsonb not null default '[]'::jsonb,
  "prerequisites" jsonb not null default '[]'::jsonb,
  "tags" text[] not null default '{}',
  "what_you_build" text,
  "language" text not null default 'en',
  "certificate_enabled" boolean not null default true,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "course_enrollments" (
  "id" uuid primary key default gen_random_uuid(),
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "course_id" uuid not null,
  "company_id" uuid,
  "status" text not null default 'active',
  "student_first_name" text,
  "student_last_name" text,
  "course_title" text,
  "enrolled_at" timestamptz not null default now(),
  "clerk_id" text,
  unique ("student_id", "course_id")
);

create table if not exists "entitlements" (
  "id" uuid primary key default gen_random_uuid(),
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "company_id" uuid references "companies"("id") on delete set null,
  "source" text not null default 'self',
  "status" text not null default 'active',
  "granted_by" uuid references "users"("id") on delete set null,
  "granted_at" timestamptz not null default now(),
  "expires_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "student_capstone_progress" (
  "id" uuid primary key default gen_random_uuid(),
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "capstone_id" uuid not null,
  "current_stage" integer not null default 1,
  "is_approved" boolean not null default false,
  "requirement_uploaded" boolean not null default false,
  "submitted_for_review" boolean not null default false,
  "stage1_submitted" boolean not null default false,
  "stage1_approved" boolean not null default false,
  "stage2_submitted" boolean not null default false,
  "stage2_approved" boolean not null default false,
  "stage3_submitted" boolean not null default false,
  "stage3_approved" boolean not null default false,
  "certificate_requested" boolean not null default false,
  "certificate_issued" boolean not null default false,
  "completed" boolean not null default false,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("student_id", "capstone_id")
);

create table if not exists "assignments" (
  "id" uuid primary key default gen_random_uuid(),
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "lesson_id" uuid,
  "created_by" uuid references "profiles"("id") on delete set null,
  "title" text not null,
  "instructions" text not null,
  "due_at" timestamptz,
  "submission_types" text[] not null default array['text']::text[],
  "max_attempts" integer not null default 1,
  "is_required" boolean not null default true,
  "status" text not null default 'draft',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "rubrics" (
  "id" uuid primary key default gen_random_uuid(),
  "assignment_id" uuid not null unique references "assignments"("id") on delete cascade,
  "title" text not null default 'Evaluation rubric',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "rubric_criteria" (
  "id" uuid primary key default gen_random_uuid(),
  "rubric_id" uuid not null references "rubrics"("id") on delete cascade,
  "title" text not null,
  "description" text,
  "max_points" integer not null,
  "position" integer not null default 0
);

create table if not exists "assignment_submissions" (
  "id" uuid primary key default gen_random_uuid(),
  "assignment_id" uuid not null references "assignments"("id") on delete cascade,
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "attempt" integer not null default 1,
  "status" text not null default 'submitted',
  "content" text,
  "repo_url" text,
  "link_url" text,
  "submitted_at" timestamptz not null default now(),
  "reviewed_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("assignment_id", "student_id", "attempt")
);

create table if not exists "submission_files" (
  "id" uuid primary key default gen_random_uuid(),
  "submission_id" uuid not null references "assignment_submissions"("id") on delete cascade,
  "storage_path" text not null,
  "file_name" text not null,
  "mime_type" text,
  "size_bytes" integer,
  "created_at" timestamptz not null default now()
);

create table if not exists "assignment_reviews" (
  "id" uuid primary key default gen_random_uuid(),
  "submission_id" uuid not null references "assignment_submissions"("id") on delete cascade,
  "reviewer_id" uuid not null references "profiles"("id") on delete cascade,
  "decision" text not null,
  "overall_feedback" text,
  "total_score" integer,
  "created_at" timestamptz not null default now()
);

create table if not exists "review_scores" (
  "id" uuid primary key default gen_random_uuid(),
  "review_id" uuid not null references "assignment_reviews"("id") on delete cascade,
  "criterion_id" uuid not null references "rubric_criteria"("id") on delete cascade,
  "points" integer not null,
  "comment" text,
  unique ("review_id", "criterion_id")
);

create table if not exists "project_templates" (
  "id" uuid primary key default gen_random_uuid(),
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "created_by" uuid references "profiles"("id") on delete set null,
  "title" text not null,
  "description" text,
  "status" text not null default 'draft',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table if not exists "project_phases" (
  "id" uuid primary key default gen_random_uuid(),
  "template_id" uuid not null references "project_templates"("id") on delete cascade,
  "title" text not null,
  "description" text,
  "position" integer not null default 0
);

create table if not exists "project_milestones" (
  "id" uuid primary key default gen_random_uuid(),
  "phase_id" uuid not null references "project_phases"("id") on delete cascade,
  "title" text not null,
  "description" text,
  "acceptance_criteria" text,
  "estimated_hours" integer,
  "due_offset_days" integer,
  "is_required" boolean not null default true,
  "position" integer not null default 0
);

create table if not exists "project_instances" (
  "id" uuid primary key default gen_random_uuid(),
  "template_id" uuid not null references "project_templates"("id") on delete cascade,
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "status" text not null default 'active',
  "started_at" timestamptz not null default now(),
  "completed_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("template_id", "student_id")
);

create table if not exists "project_instance_milestones" (
  "id" uuid primary key default gen_random_uuid(),
  "instance_id" uuid not null references "project_instances"("id") on delete cascade,
  "milestone_id" uuid not null references "project_milestones"("id") on delete cascade,
  "status" text not null default 'locked',
  "due_at" timestamptz,
  "submitted_at" timestamptz,
  "reviewed_at" timestamptz,
  unique ("instance_id", "milestone_id")
);

create table if not exists "project_milestone_submissions" (
  "id" uuid primary key default gen_random_uuid(),
  "instance_milestone_id" uuid not null references "project_instance_milestones"("id") on delete cascade,
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "attempt" integer not null default 1,
  "content" text,
  "repo_url" text,
  "link_url" text,
  "submitted_at" timestamptz not null default now(),
  "reviewer_id" uuid references "profiles"("id") on delete set null,
  "decision" text,
  "feedback" text,
  "reviewed_at" timestamptz,
  unique ("instance_milestone_id", "attempt")
);

create table if not exists "project_milestone_files" (
  "id" uuid primary key default gen_random_uuid(),
  "submission_id" uuid not null references "project_milestone_submissions"("id") on delete cascade,
  "storage_path" text not null,
  "file_name" text not null,
  "mime_type" text,
  "size_bytes" integer,
  "created_at" timestamptz not null default now()
);

create table if not exists "notifications" (
  "id" uuid primary key default gen_random_uuid(),
  "profile_id" uuid not null references "profiles"("id") on delete cascade,
  "type" text not null,
  "title" text not null,
  "body" text,
  "link_url" text,
  "metadata" jsonb not null default '{}'::jsonb,
  "dedupe_key" text,
  "read_at" timestamptz,
  "created_at" timestamptz not null default now()
);

create unique index if not exists "notifications_profile_dedupe_key"
  on "notifications" ("profile_id", "dedupe_key") where "dedupe_key" is not null;

create table if not exists "audit_logs" (
  "id" uuid primary key default gen_random_uuid(),
  "actor_user_id" uuid references "users"("id") on delete set null,
  "actor_profile_id" uuid references "profiles"("id") on delete set null,
  "company_id" uuid references "companies"("id") on delete set null,
  "action" text not null,
  "resource_type" text not null,
  "resource_id" text not null,
  "metadata" jsonb not null default '{}'::jsonb,
  "ip" text,
  "user_agent" text,
  "created_at" timestamptz not null default now()
);
