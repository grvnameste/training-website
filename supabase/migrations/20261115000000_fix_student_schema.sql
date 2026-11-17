-- ============================================================================
-- Migration: Fix Student Profile Fields, Stage 3 File Metadata, Lesson Progress,
--            Questionnaire Results & Activity Tracking
-- Idempotent script for PostgreSQL / Supabase
-- ============================================================================

-- 1. Extend profiles with student portfolio, skills, bio, and resume fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE "profiles" ADD COLUMN "first_name" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE "profiles" ADD COLUMN "last_name" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'about') THEN
        ALTER TABLE "profiles" ADD COLUMN "about" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'projects') THEN
        ALTER TABLE "profiles" ADD COLUMN "projects" JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
        ALTER TABLE "profiles" ADD COLUMN "skills" JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'resume_data') THEN
        ALTER TABLE "profiles" ADD COLUMN "resume_data" JSONB;
    END IF;
END $$;

-- 2. Extend stage3_submissions with file_name for teacher/student file display
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stage3_submissions' AND column_name = 'file_name') THEN
        ALTER TABLE "stage3_submissions" ADD COLUMN "file_name" TEXT;
    END IF;
END $$;

-- 3. Lesson progress tracking (used by Continue Learning & playback sync)
CREATE TABLE IF NOT EXISTS "student_lesson_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "course_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "completed_lessons" JSONB DEFAULT '[]'::jsonb,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "student_lesson_progress_student_course_key" UNIQUE ("student_id", "course_id")
);

-- 4. Questionnaire results persistence
CREATE TABLE IF NOT EXISTS "questionnaire_results" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "career_answers" JSONB,
    "career_open_answers" JSONB,
    "culture_answers" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Student activity timeline
CREATE TABLE IF NOT EXISTS "student_activity" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
