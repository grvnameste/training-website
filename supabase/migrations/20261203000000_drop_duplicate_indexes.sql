-- Supabase linter 0009 (duplicate_index): several tables carry 2-4 unique
-- constraints/indexes over identical column sets. All but one of each set are
-- pure storage/maintenance overhead.
--
-- These objects exist only in the live database (they are not created by the
-- repo's migrations), so every drop is guarded to stay portable. Foreign keys
-- on these tables reference the primary keys, and the app's upserts target
-- columns rather than constraint names, so no dependent object is affected.

-- boards: keep unique_board (capstone_id, student_id)
alter table if exists public.boards drop constraint if exists unique_board_per_student;
alter table if exists public.boards drop constraint if exists unique_student_board;
alter table if exists public.boards drop constraint if exists unique_student_capstone_board;

-- certificates: keep certificates_student_id_course_id_key (student_id, course_id)
alter table if exists public.certificates
  drop constraint if exists certificates_unique_student_course;

-- course_enrollments: keep course_enrollments_student_id_course_id_key
alter table if exists public.course_enrollments drop constraint if exists unique_enrollment;

-- requirement_documents: keep the constraint unique_student_capstone and drop
-- the redundant bare index over the same columns.
alter table if exists public.requirement_documents
  drop constraint if exists one_requirement_per_student;
drop index if exists public.one_requirement_per_student;

-- student_capstone_progress: keep student_capstone_unique (student_id, capstone_id)
alter table if exists public.student_capstone_progress
  drop constraint if exists unique_student_capstone_progress;
