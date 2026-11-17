-- The legacy constraint only permitted LOGIN/LOGOUT, so real learning events
-- were rejected and swallowed by non-blocking catch blocks.

alter table "student_activity" drop constraint if exists "student_activity_type_check";

alter table "student_activity" add constraint "student_activity_type_check"
  check ("type" in (
    'LOGIN',
    'LOGOUT',
    'QUESTIONNAIRE_COMPLETED',
    'QUIZ_COMPLETED',
    'LESSON_COMPLETED',
    'STAGE1_SUBMITTED',
    'STAGE2_SUBMITTED',
    'STAGE3_SUBMITTED',
    'CERTIFICATE_REQUESTED',
    'CAPSTONE_APPROVED',
    'ENROLLED'
  ));
