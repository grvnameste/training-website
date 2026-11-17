-- Platform bootstrap applied after the generated Drizzle baseline on fresh
-- databases. Safe to run against Supabase, where the roles and storage schema
-- already exist.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role noinherit;
  end if;
end $$;

create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text,
  public boolean not null default false,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values
  ('course-thumbnails', 'course-thumbnails', true),
  ('lesson-videos', 'lesson-videos', true),
  ('lesson-resources', 'lesson-resources', false),
  ('submission-files', 'submission-files', false)
on conflict (id) do nothing;

insert into companies (id, name, slug, kind, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'ReadNRevise',
  'readnrevise',
  'institute',
  'active'
)
on conflict (id) do nothing;

create table if not exists "schema_migrations" (
  "filename" text primary key,
  "checksum" text not null,
  "applied_at" timestamptz not null default now(),
  "execution_ms" integer
);

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema storage to anon, authenticated, service_role;

do $$
declare
  table_row record;
begin
  for table_row in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', table_row.tablename);
    execute format('revoke all on public.%I from anon, authenticated', table_row.tablename);
    execute format('grant all on public.%I to service_role', table_row.tablename);
  end loop;
end $$;

revoke all on all sequences in schema public from anon, authenticated;
grant all on all sequences in schema public to service_role;
