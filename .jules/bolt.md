# Bolt's Journal - Critical Learnings Only

## 2026-10-26 - SQLite Foreign Key Indexing Bottlenecks in Next.js API Routes
**Learning:** SQLite does not automatically create indexes on foreign key columns or multi-column filter predicates (`class_id`, `student_id`, `subject_id` + `semester_id`, `class_id` + `date`). Without explicit `CREATE INDEX` declarations, queries joining `students`, `conduct_events`, and `attendance_sessions` forced SQLite to either perform full table scans or build expensive automatic covering indexes on every API request.
**Action:** Always verify SQLite query plans using `EXPLAIN QUERY PLAN` for joined or filtered queries and declare explicit `CREATE INDEX IF NOT EXISTS` statements during schema initialization.
