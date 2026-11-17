-- Phase 1 backfill: idempotent.
-- Existing courses are platform-owned until an institute is explicitly assigned.

insert into "companies" ("id", "name", "slug", "kind", "status")
values (
  '00000000-0000-0000-0000-000000000001',
  'ReadNRevise Academy',
  'readnrevise',
  'platform',
  'active'
)
on conflict ("slug") do nothing;

update "courses"
set "company_id" = (select "id" from "companies" where "slug" = 'readnrevise')
where "company_id" is null;

update "courses"
set "status" = 'published',
    "published_at" = coalesce("published_at", "created_at", now())
where "status" is null or "status" = 'published';

update "course_enrollments" e
set "company_id" = c."company_id"
from "courses" c
where e."course_id" = c."id" and e."company_id" is null;

insert into "entitlements" ("student_id", "course_id", "company_id", "source", "status", "granted_at")
select e."student_id", e."course_id", c."company_id", 'legacy', 'active',
       coalesce(e."enrolled_at", now())
from "course_enrollments" e
join "courses" c on c."id" = e."course_id"
on conflict do nothing;

insert into "company_memberships" ("company_id", "user_id", "role", "status")
select
  (select "id" from "companies" where "slug" = 'readnrevise'),
  u."id",
  case u."role"
    when 'super_admin' then 'org_admin'
    when 'teacher' then 'instructor'
    else 'student'
  end,
  'active'
from "users" u
where u."role" in ('super_admin', 'teacher')
on conflict do nothing;
