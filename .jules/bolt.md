## 2026-10-24 - Foreign Key Indexes on SQLite Schemas
**Learning:** SQLite does not automatically index foreign keys (`students.class_id`, `conduct_events.student_id`, `attendance_records.session_id`, `grades.student_id`). Without explicit indexes, queries joining or filtering on foreign key columns resort to full table scans or require SQLite runtime to build dynamic automatic covering indexes.
**Action:** Always define `CREATE INDEX IF NOT EXISTS` on key foreign key columns and frequently queried date/filter columns when setting up SQLite tables.
