-- Addresses Supabase database linter advisories:
--   0011 function_search_path_mutable
--   0025 public_bucket_allows_listing
--   0028/0029 anon/authenticated can execute SECURITY DEFINER function
--
-- Guards keep this migration portable to non-Supabase databases built from
-- drizzle/ plus supabase/baseline/platform.sql, where the flagged functions
-- and storage.objects do not exist.

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.create_default_lists()',
    'public.auto_create_capstone_course()'
  ]
  loop
    if to_regprocedure(fn) is not null then
      execute format('alter function %s set search_path = pg_catalog, public, pg_temp', fn);
    end if;
  end loop;
end $$;

-- Trigger functions never check EXECUTE when fired; revoking only removes the
-- PostgREST /rest/v1/rpc surface. PUBLIC is the grant they inherit by default.
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.handle_new_user()',
    'public.rls_auto_enable()'
  ]
  loop
    if to_regprocedure(fn) is not null then
      execute format('revoke execute on function %s from public, anon, authenticated', fn);
    end if;
  end loop;
end $$;

alter default privileges in schema public revoke execute on functions from public;

-- Public buckets serve /storage/v1/object/public/* without consulting
-- storage.objects RLS, and the app never lists objects. These broad SELECT
-- policies only enabled anonymous enumeration.
do $$
declare
  policy_name text;
begin
  if to_regclass('storage.objects') is null then
    return;
  end if;

  foreach policy_name in array array[
    'Allow public read',
    'Public can read requirement files',
    'allow read thumbnails',
    'allow read lesson videos',
    'authenticated can read lesson videos bucket',
    'students can read lesson videos'
  ]
  loop
    execute format('drop policy if exists %I on storage.objects', policy_name);
  end loop;
end $$;
