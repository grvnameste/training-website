-- Password-based authentication.
-- Creates a dedicated "users" table for credentials (never exposed to the
-- public Supabase client) and links it to the existing "profiles" table.

CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Credentials must never be reachable through PostgREST. The app's database
-- connection (postgres role) owns the table and bypasses RLS.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Link each profile to its credential record.
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "user_id" UUID;
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_user_id_fkey";
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove Clerk-dependent RLS policies. Each one is redundant with an existing
-- permissive policy on the same table, so no access is lost.
DROP POLICY IF EXISTS "Allow user to read own profile" ON "profiles";
DROP POLICY IF EXISTS "Allow teacher & admin" ON "requirement_documents";
DROP POLICY IF EXISTS "student_insert_requirement" ON "requirement_documents";
DROP POLICY IF EXISTS "student_read_requirement" ON "requirement_documents";

-- Legacy compatibility views referenced profiles.clerk_id.
DROP VIEW IF EXISTS "student_profiles";
DROP VIEW IF EXISTS "students";

-- questionnaire_results.user_id was a foreign key to profiles.clerk_id. Legacy
-- rows are keyed by Clerk ids that cannot be cast to UUID, so the constraint is
-- dropped and the historical data is left untouched.
ALTER TABLE "questionnaire_results" DROP CONSTRAINT IF EXISTS "questionnaire_results_user_id_fkey";

-- The Clerk helper function is a SQL function whose body reads profiles.clerk_id,
-- so it must be dropped before the column.
DROP FUNCTION IF EXISTS clerk_to_uuid(text);

ALTER TABLE "profiles" DROP COLUMN IF EXISTS "clerk_id";

-- Recreate the compatibility views without the Clerk column.
CREATE VIEW "student_profiles" AS
SELECT
    "id",
    COALESCE("name", "full_name", 'Student') AS "name",
    "email",
    "role",
    "avatar_url",
    "phone",
    "created_at",
    "updated_at"
FROM "profiles";

CREATE VIEW "students" AS
SELECT
    "id",
    COALESCE("name", "full_name", 'Student') AS "name",
    "email",
    "role",
    "avatar_url",
    "phone",
    "created_at",
    "updated_at"
FROM "profiles";
