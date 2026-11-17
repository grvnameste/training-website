-- Phase 2 catalog metadata. Additive and safe to run before the Phase 2 UI.

alter table "courses" add column if not exists "level" text not null default 'beginner';
alter table "courses" add column if not exists "estimated_minutes" integer;
alter table "courses" add column if not exists "outcomes" jsonb not null default '[]'::jsonb;
alter table "courses" add column if not exists "prerequisites" jsonb not null default '[]'::jsonb;
alter table "courses" add column if not exists "tags" text[] not null default '{}';
alter table "courses" add column if not exists "what_you_build" text;
alter table "courses" add column if not exists "language" text not null default 'en';
alter table "courses" add column if not exists "certificate_enabled" boolean not null default true;

alter table "lessons" add column if not exists "summary" text;
alter table "lessons" add column if not exists "objectives" jsonb not null default '[]'::jsonb;
alter table "lessons" add column if not exists "estimated_minutes" integer;
alter table "lessons" add column if not exists "completion_mode" text not null default 'manual';
alter table "lessons" add column if not exists "is_preview" boolean not null default false;

create index if not exists "courses_company_status_level_idx" on "courses" ("company_id", "status", "level");
create index if not exists "courses_tags_gin_idx" on "courses" using gin ("tags");
create index if not exists "lessons_section_preview_idx" on "lessons" ("section_id", "is_preview");
