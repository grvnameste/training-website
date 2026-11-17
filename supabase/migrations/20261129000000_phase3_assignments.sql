-- Phase 3A: assignments, rubrics, submissions, and reviews.

create table if not exists "assignments" (
  "id" uuid primary key default gen_random_uuid(),
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "lesson_id" uuid references "lessons"("id") on delete set null,
  "created_by" uuid references "profiles"("id") on delete set null,
  "title" text not null,
  "instructions" text not null,
  "due_at" timestamptz,
  "submission_types" text[] not null default ARRAY['text']::text[],
  "max_attempts" integer not null default 1,
  "is_required" boolean not null default true,
  "status" text not null default 'draft' check ("status" in ('draft','published','archived')),
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index if not exists "assignments_course_status_idx" on "assignments" ("course_id", "status");
create index if not exists "assignments_due_idx" on "assignments" ("due_at");

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
  "max_points" integer not null check ("max_points" > 0),
  "position" integer not null default 0
);
create index if not exists "rubric_criteria_rubric_position_idx" on "rubric_criteria" ("rubric_id", "position");

create table if not exists "assignment_submissions" (
  "id" uuid primary key default gen_random_uuid(),
  "assignment_id" uuid not null references "assignments"("id") on delete cascade,
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "attempt" integer not null default 1,
  "status" text not null default 'submitted'
    check ("status" in ('submitted','under_review','changes_requested','approved','graded')),
  "content" text,
  "repo_url" text,
  "link_url" text,
  "submitted_at" timestamptz not null default now(),
  "reviewed_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("assignment_id", "student_id", "attempt")
);
create index if not exists "assignment_submissions_assignment_status_idx"
  on "assignment_submissions" ("assignment_id", "status");
create index if not exists "assignment_submissions_student_idx"
  on "assignment_submissions" ("student_id", "submitted_at" desc);

create table if not exists "submission_files" (
  "id" uuid primary key default gen_random_uuid(),
  "submission_id" uuid not null references "assignment_submissions"("id") on delete cascade,
  "storage_path" text not null,
  "file_name" text not null,
  "mime_type" text,
  "size_bytes" integer,
  "created_at" timestamptz not null default now()
);
create index if not exists "submission_files_submission_idx" on "submission_files" ("submission_id");

create table if not exists "assignment_reviews" (
  "id" uuid primary key default gen_random_uuid(),
  "submission_id" uuid not null references "assignment_submissions"("id") on delete cascade,
  "reviewer_id" uuid not null references "profiles"("id") on delete cascade,
  "decision" text not null check ("decision" in ('approved','changes_requested','graded')),
  "overall_feedback" text,
  "total_score" integer,
  "created_at" timestamptz not null default now()
);
create index if not exists "assignment_reviews_submission_idx" on "assignment_reviews" ("submission_id");

create table if not exists "review_scores" (
  "id" uuid primary key default gen_random_uuid(),
  "review_id" uuid not null references "assignment_reviews"("id") on delete cascade,
  "criterion_id" uuid not null references "rubric_criteria"("id") on delete cascade,
  "points" integer not null check ("points" >= 0),
  "comment" text
);
create unique index if not exists "review_scores_review_criterion_key"
  on "review_scores" ("review_id", "criterion_id");

alter table "assignments" enable row level security;
alter table "rubrics" enable row level security;
alter table "rubric_criteria" enable row level security;
alter table "assignment_submissions" enable row level security;
alter table "submission_files" enable row level security;
alter table "assignment_reviews" enable row level security;
alter table "review_scores" enable row level security;

revoke all on "assignments", "rubrics", "rubric_criteria", "assignment_submissions",
  "submission_files", "assignment_reviews", "review_scores" from anon, authenticated;

grant all on "assignments", "rubrics", "rubric_criteria", "assignment_submissions",
  "submission_files", "assignment_reviews", "review_scores" to service_role;

insert into storage.buckets (id, name, public)
values ('submission-files', 'submission-files', false)
on conflict (id) do nothing;
