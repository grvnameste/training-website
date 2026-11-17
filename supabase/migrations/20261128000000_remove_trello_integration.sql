-- Optional destructive cleanup for the removed Trello integration.
-- Review and apply only after confirming no historical data is needed.
-- The application no longer reads or writes these columns/tables.

alter table "student_capstone_progress" drop column if exists "trello_board_id";
alter table "student_capstone_progress" drop column if exists "trello_board_url";

drop table if exists "trello_access_requests";
