-- Phase 3C: in-app notifications.

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

create index if not exists "notifications_profile_created_idx"
  on "notifications" ("profile_id", "created_at" desc);
create index if not exists "notifications_profile_unread_idx"
  on "notifications" ("profile_id") where "read_at" is null;
create unique index if not exists "notifications_profile_dedupe_key"
  on "notifications" ("profile_id", "dedupe_key") where "dedupe_key" is not null;

alter table "notifications" enable row level security;
revoke all on "notifications" from anon, authenticated;
grant all on "notifications" to service_role;
