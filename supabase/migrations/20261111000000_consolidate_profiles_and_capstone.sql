-- ============================================================================
-- Migration: Consolidate Duplicate Student Profile Tables & Unify Capstone Tracking
-- Idempotent script for PostgreSQL / Supabase / Prisma
-- ============================================================================

-- Enable pgcrypto / uuid extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. CONSOLIDATE AND NORMALIZE "profiles" TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clerk_id" TEXT UNIQUE,
    "name" TEXT,
    "full_name" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "avatar_url" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all required columns exist on "profiles"
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'clerk_id') THEN
        ALTER TABLE "profiles" ADD COLUMN "clerk_id" TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE "profiles" ADD COLUMN "name" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE "profiles" ADD COLUMN "full_name" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE "profiles" ADD COLUMN "email" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE "profiles" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'student';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE "profiles" ADD COLUMN "avatar_url" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE "profiles" ADD COLUMN "phone" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE "profiles" ADD COLUMN "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE "profiles" ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Synchronize name and full_name across existing profile records
UPDATE "profiles"
SET 
    name = COALESCE(name, full_name),
    full_name = COALESCE(full_name, name)
WHERE name IS NULL OR full_name IS NULL;

-- ----------------------------------------------------------------------------
-- 2. MERGE HISTORICAL DATA FROM "student_profiles" (IF TABLE EXISTS)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'student_profiles' 
          AND table_type = 'BASE TABLE'
    ) THEN
        -- Insert non-conflicting rows or update missing names
        INSERT INTO "profiles" ("id", "name", "full_name", "created_at", "updated_at")
        SELECT 
            sp."id"::UUID,
            sp."name",
            sp."name",
            NOW(),
            NOW()
        FROM "student_profiles" sp
        ON CONFLICT ("id") DO UPDATE
        SET 
            name = COALESCE("profiles"."name", EXCLUDED."name"),
            full_name = COALESCE("profiles"."full_name", EXCLUDED."full_name");

        -- Drop the duplicate physical table to replace with a view
        DROP TABLE "student_profiles" CASCADE;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. MERGE HISTORICAL DATA FROM "students" (IF TABLE EXISTS)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'students' 
          AND table_type = 'BASE TABLE'
    ) THEN
        INSERT INTO "profiles" ("id", "name", "full_name", "created_at", "updated_at")
        SELECT 
            s."id"::UUID,
            s."name",
            s."name",
            NOW(),
            NOW()
        FROM "students" s
        ON CONFLICT ("id") DO UPDATE
        SET 
            name = COALESCE("profiles"."name", EXCLUDED."name"),
            full_name = COALESCE("profiles"."full_name", EXCLUDED."full_name");

        DROP TABLE "students" CASCADE;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. CREATE BACKWARD-COMPATIBLE VIEWS FOR "student_profiles" AND "students"
-- ----------------------------------------------------------------------------
-- Drop existing views first so PostgreSQL does not throw 42P16 if legacy view
-- column names or ordering differed from the new projection.
DROP VIEW IF EXISTS "student_profiles" CASCADE;
CREATE VIEW "student_profiles" AS
SELECT 
    "id",
    "clerk_id",
    COALESCE("name", "full_name", 'Student') AS "name",
    "email",
    "role",
    "avatar_url",
    "phone",
    "created_at",
    "updated_at"
FROM "profiles";

DROP VIEW IF EXISTS "students" CASCADE;
CREATE VIEW "students" AS
SELECT 
    "id",
    "clerk_id",
    COALESCE("name", "full_name", 'Student') AS "name",
    "email",
    "role",
    "avatar_url",
    "phone",
    "created_at",
    "updated_at"
FROM "profiles";

-- ----------------------------------------------------------------------------
-- 5. NORMALIZE COLUMN NAMING (SNAKE_CASE) ON COURSES, SECTIONS, LESSONS
-- ----------------------------------------------------------------------------
-- Rename courses."teacherId" -> teacher_id if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'teacherId')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'teacher_id') THEN
        ALTER TABLE "courses" RENAME COLUMN "teacherId" TO "teacher_id";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE "courses" ADD COLUMN "thumbnail_url" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'is_capstone') THEN
        ALTER TABLE "courses" ADD COLUMN "is_capstone" BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'parent_course_id') THEN
        ALTER TABLE "courses" ADD COLUMN "parent_course_id" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'created_at') THEN
        ALTER TABLE "courses" ADD COLUMN "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'updated_at') THEN
        ALTER TABLE "courses" ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Rename sections."courseId" -> course_id, "orderIndex" -> order_index if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sections' AND column_name = 'courseId')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sections' AND column_name = 'course_id') THEN
        ALTER TABLE "sections" RENAME COLUMN "courseId" TO "course_id";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sections' AND column_name = 'orderIndex')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sections' AND column_name = 'order_index') THEN
        ALTER TABLE "sections" RENAME COLUMN "orderIndex" TO "order_index";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sections' AND column_name = 'created_at') THEN
        ALTER TABLE "sections" ADD COLUMN "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Rename lessons."sectionId" -> section_id, "orderIndex" -> order_index if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'sectionId')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'section_id') THEN
        ALTER TABLE "lessons" RENAME COLUMN "sectionId" TO "section_id";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'orderIndex')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'order_index') THEN
        ALTER TABLE "lessons" RENAME COLUMN "orderIndex" TO "order_index";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'video_url') THEN
        ALTER TABLE "lessons" ADD COLUMN "video_url" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'created_at') THEN
        ALTER TABLE "lessons" ADD COLUMN "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. UNIFY CAPSTONE TRACKING: "student_capstone_progress"
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "student_capstone_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "capstone_id" TEXT NOT NULL,
    "current_stage" INTEGER NOT NULL DEFAULT 1,
    "stage1_submitted" BOOLEAN NOT NULL DEFAULT FALSE,
    "stage1_approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "stage2_submitted" BOOLEAN NOT NULL DEFAULT FALSE,
    "stage2_approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "stage3_submitted" BOOLEAN NOT NULL DEFAULT FALSE,
    "stage3_approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "trello_board_url" TEXT,
    "trello_board_id" TEXT,
    "submitted_for_review" BOOLEAN NOT NULL DEFAULT FALSE,
    "certificate_requested" BOOLEAN NOT NULL DEFAULT FALSE,
    "certificate_issued" BOOLEAN NOT NULL DEFAULT FALSE,
    "completed" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "student_capstone_progress_student_capstone_key" UNIQUE ("student_id", "capstone_id")
);

-- Harmonize legacy column variants (e.g. stage1_submit -> stage1_submitted)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_capstone_progress' AND column_name = 'stage1_submit') THEN
        UPDATE "student_capstone_progress" 
        SET "stage1_submitted" = COALESCE("stage1_submitted", "stage1_submit", FALSE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_capstone_progress' AND column_name = 'stage2_submit') THEN
        UPDATE "student_capstone_progress" 
        SET "stage2_submitted" = COALESCE("stage2_submitted", "stage2_submit", FALSE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_capstone_progress' AND column_name = 'stage3_submit') THEN
        UPDATE "student_capstone_progress" 
        SET "stage3_submitted" = COALESCE("stage3_submitted", "stage3_submit", FALSE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_capstone_progress' AND column_name = 'stage1_approve') THEN
        UPDATE "student_capstone_progress" 
        SET "stage1_approved" = COALESCE("stage1_approved", "stage1_approve", FALSE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_capstone_progress' AND column_name = 'stage2_approve') THEN
        UPDATE "student_capstone_progress" 
        SET "stage2_approved" = COALESCE("stage2_approved", "stage2_approve", FALSE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_capstone_progress' AND column_name = 'stage3_approve') THEN
        UPDATE "student_capstone_progress" 
        SET "stage3_approved" = COALESCE("stage3_approved", "stage3_approve", FALSE);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 7. NORMALIZE CAPSTONE SUPPORTING TABLES
-- ----------------------------------------------------------------------------
-- Requirement Documents (Stage 1 submissions)
CREATE TABLE IF NOT EXISTS "requirement_documents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "capstone_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "requirement_documents_student_capstone_key" UNIQUE ("student_id", "capstone_id")
);

-- Stage 2 Submissions (Project Board / Kanban snapshot)
CREATE TABLE IF NOT EXISTS "stage2_submissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "capstone_id" TEXT NOT NULL,
    "board_id" TEXT,
    "board_data" JSONB,
    "approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stage 3 Submissions (Code / Deployment links & review files)
CREATE TABLE IF NOT EXISTS "stage3_submissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "capstone_id" TEXT NOT NULL,
    "file_url" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Capstone Meetings (Instructor <-> Student 1:1 Reviews)
CREATE TABLE IF NOT EXISTS "capstone_meetings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "capstone_id" TEXT NOT NULL,
    "meeting_link" TEXT NOT NULL,
    "scheduled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS "course_enrollments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "course_enrollments_student_course_key" UNIQUE ("student_id", "course_id")
);

-- Certificates
CREATE TABLE IF NOT EXISTS "certificates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "course_id" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz Submissions
CREATE TABLE IF NOT EXISTS "quiz_submissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "quiz_id" TEXT NOT NULL,
    "quiz_title" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT FALSE,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "answers" JSONB,
    "feedback" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backward-compatible capstone_courses view
DROP VIEW IF EXISTS "capstone_courses" CASCADE;
CREATE VIEW "capstone_courses" AS
SELECT 
    "id",
    "teacher_id",
    "title",
    "subtitle",
    "description",
    "price",
    "thumbnail_url",
    "is_capstone",
    "parent_course_id",
    "created_at",
    "updated_at"
FROM "courses"
WHERE "is_capstone" = TRUE OR "title" ILIKE '%capstone%';

-- ----------------------------------------------------------------------------
-- 8. HELPER RPC FUNCTION (clerk_to_uuid)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS clerk_to_uuid(text);
CREATE OR REPLACE FUNCTION clerk_to_uuid(clerk_id text)
RETURNS uuid AS $$
DECLARE
    found_id uuid;
BEGIN
    SELECT id INTO found_id FROM profiles WHERE profiles.clerk_id = clerk_to_uuid.clerk_id LIMIT 1;
    IF found_id IS NULL THEN
        INSERT INTO profiles (clerk_id, role)
        VALUES (clerk_to_uuid.clerk_id, 'student')
        ON CONFLICT (clerk_id) DO UPDATE SET updated_at = NOW()
        RETURNING id INTO found_id;
    END IF;
    RETURN found_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
