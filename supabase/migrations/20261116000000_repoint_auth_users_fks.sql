-- Supabase Auth is no longer used by the application. Repoint the remaining
-- app-table foreign keys from auth.users to profiles so inserts use the app's
-- own profile ids. All three tables are currently empty, so no data migration
-- is needed.

ALTER TABLE "student_lesson_progress" DROP CONSTRAINT IF EXISTS "student_lesson_progress_student_id_fkey";
ALTER TABLE "student_lesson_progress" ADD CONSTRAINT "student_lesson_progress_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

ALTER TABLE "trello_access_requests" DROP CONSTRAINT IF EXISTS "trello_access_requests_student_id_fkey";
ALTER TABLE "trello_access_requests" ADD CONSTRAINT "trello_access_requests_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE;

ALTER TABLE "chat_rooms" DROP CONSTRAINT IF EXISTS "chat_rooms_teacher_id_fkey";
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "profiles"("id") ON DELETE CASCADE;
