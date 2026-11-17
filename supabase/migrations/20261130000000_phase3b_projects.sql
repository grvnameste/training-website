-- Phase 3B: configurable project templates, phases, milestones, instances,
-- milestone submissions, and reviews.

create table if not exists "project_templates" (
  "id" uuid primary key default gen_random_uuid(),
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "created_by" uuid references "profiles"("id") on delete set null,
  "title" text not null,
  "description" text,
  "status" text not null default 'draft' check ("status" in ('draft','published','archived')),
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index if not exists "project_templates_course_status_idx" on "project_templates" ("course_id","status");

create table if not exists "project_phases" (
  "id" uuid primary key default gen_random_uuid(),
  "template_id" uuid not null references "project_templates"("id") on delete cascade,
  "title" text not null,
  "description" text,
  "position" integer not null default 0
);
create index if not exists "project_phases_template_position_idx" on "project_phases" ("template_id","position");

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
create index if not exists "project_milestones_phase_position_idx" on "project_milestones" ("phase_id","position");

create table if not exists "project_instances" (
  "id" uuid primary key default gen_random_uuid(),
  "template_id" uuid not null references "project_templates"("id") on delete cascade,
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "status" text not null default 'active' check ("status" in ('active','completed','archived')),
  "started_at" timestamptz not null default now(),
  "completed_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("template_id","student_id")
);
create index if not exists "project_instances_student_idx" on "project_instances" ("student_id","status");

create table if not exists "project_instance_milestones" (
  "id" uuid primary key default gen_random_uuid(),
  "instance_id" uuid not null references "project_instances"("id") on delete cascade,
  "milestone_id" uuid not null references "project_milestones"("id") on delete cascade,
  "status" text not null default 'locked'
    check ("status" in ('locked','available','submitted','changes_requested','approved')),
  "due_at" timestamptz,
  "submitted_at" timestamptz,
  "reviewed_at" timestamptz,
  unique ("instance_id","milestone_id")
);
create index if not exists "project_instance_milestones_instance_status_idx"
  on "project_instance_milestones" ("instance_id","status");

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
  "decision" text check ("decision" in ('approved','changes_requested')),
  "feedback" text,
  "reviewed_at" timestamptz,
  unique ("instance_milestone_id","attempt")
);
create index if not exists "project_milestone_submissions_milestone_idx"
  on "project_milestone_submissions" ("instance_milestone_id","attempt" desc);

create table if not exists "project_milestone_files" (
  "id" uuid primary key default gen_random_uuid(),
  "submission_id" uuid not null references "project_milestone_submissions"("id") on delete cascade,
  "storage_path" text not null,
  "file_name" text not null,
  "mime_type" text,
  "size_bytes" integer,
  "created_at" timestamptz not null default now()
);
create index if not exists "project_milestone_files_submission_idx" on "project_milestone_files" ("submission_id");

alter table "project_templates" enable row level security;
alter table "project_phases" enable row level security;
alter table "project_milestones" enable row level security;
alter table "project_instances" enable row level security;
alter table "project_instance_milestones" enable row level security;
alter table "project_milestone_submissions" enable row level security;
alter table "project_milestone_files" enable row level security;

revoke all on "project_templates", "project_phases", "project_milestones",
  "project_instances", "project_instance_milestones", "project_milestone_submissions",
  "project_milestone_files" from anon, authenticated;

grant all on "project_templates", "project_phases", "project_milestones",
  "project_instances", "project_instance_milestones", "project_milestone_submissions",
  "project_milestone_files" to service_role;
