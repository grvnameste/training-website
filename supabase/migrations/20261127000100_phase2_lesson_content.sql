-- Phase 2 content model. New tables are private immediately: RLS enabled,
-- browser roles revoked, service role retained for server-side access.

create table if not exists "lesson_blocks" (
  "id" uuid primary key default gen_random_uuid(),
  "lesson_id" uuid not null references "lessons"("id") on delete cascade,
  "type" text not null,
  "position" integer not null,
  "content" jsonb not null default '{}'::jsonb,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index if not exists "lesson_blocks_lesson_position_idx" on "lesson_blocks" ("lesson_id", "position");

create table if not exists "lesson_resources" (
  "id" uuid primary key default gen_random_uuid(),
  "lesson_id" uuid not null references "lessons"("id") on delete cascade,
  "title" text not null,
  "kind" text not null default 'download',
  "storage_path" text,
  "external_url" text,
  "file_name" text,
  "mime_type" text,
  "size_bytes" integer,
  "position" integer not null default 0,
  "created_at" timestamptz not null default now()
);

create table if not exists "lesson_transcripts" (
  "lesson_id" uuid primary key references "lessons"("id") on delete cascade,
  "language" text not null default 'en',
  "full_text" text not null,
  "segments" jsonb not null default '[]'::jsonb,
  "updated_at" timestamptz not null default now()
);

create table if not exists "lesson_notes" (
  "id" uuid primary key default gen_random_uuid(),
  "student_id" uuid not null references "profiles"("id") on delete cascade,
  "lesson_id" uuid not null references "lessons"("id") on delete cascade,
  "content" text not null default '',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create unique index if not exists "lesson_notes_student_lesson_key" on "lesson_notes" ("student_id", "lesson_id");

create table if not exists "student_preferences" (
  "student_id" uuid primary key references "profiles"("id") on delete cascade,
  "goal" text,
  "level" text,
  "weekly_minutes" integer,
  "preferred_topics" text[] not null default '{}',
  "onboarding_completed_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

alter table "lesson_blocks" enable row level security;
alter table "lesson_resources" enable row level security;
alter table "lesson_transcripts" enable row level security;
alter table "lesson_notes" enable row level security;
alter table "student_preferences" enable row level security;

revoke all on "lesson_blocks", "lesson_resources", "lesson_transcripts",
  "lesson_notes", "student_preferences" from anon, authenticated;

grant all on "lesson_blocks", "lesson_resources", "lesson_transcripts",
  "lesson_notes", "student_preferences" to service_role;
