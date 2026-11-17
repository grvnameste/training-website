-- Phase 1 enforcement: browser roles lose all access to domain tables.
-- The application now reads/writes through server routes using service_role or
-- the database owner connection, both of which bypass RLS.

do $$
declare
  p record;
  r record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;

  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

revoke all on student_profiles from anon, authenticated;
revoke all on students from anon, authenticated;
revoke all on student_activity_with_profile from anon, authenticated;
revoke all on capstone_courses from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
