-- Phase 1 expand: additive tenancy, entitlement, session, audit, and progress model.
-- Live schema uses UUID ids; all new references must match.

alter table "companies" add column if not exists "kind" text not null default 'institute';
alter table "companies" add column if not exists "status" text not null default 'active';
alter table "companies" add column if not exists "updated_at" timestamptz not null default now();

alter table "users" add column if not exists "status" text not null default 'active';

alter table "courses" add column if not exists "status" text not null default 'published';
alter table "courses" add column if not exists "published_at" timestamptz;

alter table "course_enrollments" add column if not exists "company_id" uuid;
alter table "course_enrollments" add column if not exists "status" text not null default 'active';

create table if not exists "company_memberships" (
  "id" uuid primary key default gen_random_uuid(),
  "company_id" uuid not null references "companies"("id") on delete cascade,
  "user_id" uuid not null references "users"("id") on delete cascade,
  "role" text not null default 'student',
  "status" text not null default 'active',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create unique index if not exists "company_memberships_company_user_role_key"
  on "company_memberships" ("company_id", "user_id", "role");
create index if not exists "company_memberships_user_idx" on "company_memberships" ("user_id");
create index if not exists "company_memberships_company_idx" on "company_memberships" ("company_id");

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
create index if not exists "user_sessions_user_idx" on "user_sessions" ("user_id");

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
create index if not exists "entitlements_student_course_idx" on "entitlements" ("student_id", "course_id");
create index if not exists "entitlements_company_idx" on "entitlements" ("company_id");
create unique index if not exists "entitlements_active_student_course_key"
  on "entitlements" ("student_id", "course_id") where "status" = 'active';

create table if not exists "lesson_completions" (
  "id" uuid primary key default gen_random_uuid(),
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "lesson_id" uuid not null references "lessons"("id") on delete cascade,
  "completed_at" timestamptz not null default now(),
  "source" text not null default 'explicit'
);
create unique index if not exists "lesson_completions_student_lesson_key"
  on "lesson_completions" ("student_id", "lesson_id");
create index if not exists "lesson_completions_student_course_idx"
  on "lesson_completions" ("student_id", "course_id");

create table if not exists "lesson_playback" (
  "id" uuid primary key default gen_random_uuid(),
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "course_id" uuid not null references "courses"("id") on delete cascade,
  "lesson_id" uuid not null references "lessons"("id") on delete cascade,
  "position_seconds" integer not null default 0,
  "duration_seconds" integer,
  "updated_at" timestamptz not null default now()
);
create unique index if not exists "lesson_playback_student_lesson_key"
  on "lesson_playback" ("student_id", "lesson_id");

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
create index if not exists "audit_logs_resource_idx" on "audit_logs" ("resource_type", "resource_id");
create index if not exists "audit_logs_company_idx" on "audit_logs" ("company_id", "created_at" desc);
