# Bolt's Journal

## 2026-10-25 - SQLite Database Indexes for Foreign Keys & Filter Columns
**Learning:** In SQLite/better-sqlite3 applications with multiple relational joins and filtered queries (e.g. students by class, attendance records by session/student, notifications by date), missing database indexes on foreign keys causes full table scans across queries.
**Action:** Always create compound or single-column indexes (`CREATE INDEX IF NOT EXISTS`) on frequently filtered foreign keys (`class_id`, `student_id`, `session_id`, `user_id`) and status/timestamp columns in `initDatabase()`.
