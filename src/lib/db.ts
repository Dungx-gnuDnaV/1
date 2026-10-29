import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "smart_sms.db");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma("foreign_keys = ON");
    dbInstance.pragma("journal_mode = WAL");
    initDatabaseSchema(dbInstance);
  }
  return dbInstance;
}

function initDatabaseSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      role_id TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS academic_years (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_current INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS semesters (
      id TEXT PRIMARY KEY,
      academic_year_id TEXT NOT NULL,
      name TEXT NOT NULL,
      semester_number INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_current INTEGER DEFAULT 0,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      teacher_code TEXT UNIQUE NOT NULL,
      title TEXT,
      specialization TEXT NOT NULL,
      is_homeroom INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade_level INTEGER NOT NULL,
      academic_year_id TEXT NOT NULL,
      homeroom_teacher_id TEXT,
      room_number TEXT,
      student_count INTEGER DEFAULT 0,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
      FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      student_code TEXT UNIQUE NOT NULL,
      dob DATE NOT NULL,
      gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
      address TEXT,
      class_id TEXT,
      status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Graduated', 'Transferred', 'Suspended')),
      rfid_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      occupation TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS parent_student_links (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      relationship TEXT NOT NULL,
      is_primary INTEGER DEFAULT 1,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(parent_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      credits INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS teaching_assignments (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      academic_year_id TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
    );

    CREATE TABLE IF NOT EXISTS timetables (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 2 AND 7),
      period_number INTEGER NOT NULL CHECK(period_number BETWEEN 1 AND 10),
      room TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      date DATE NOT NULL,
      session_type TEXT DEFAULT 'Regular' CHECK(session_type IN ('Regular', 'Morning', 'Afternoon', 'Period')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent_Excused', 'Absent_Unexcused', 'Late', 'Early_Leave')),
      method TEXT DEFAULT 'Manual' CHECK(method IN ('Manual', 'RFID', 'Facial', 'QR')),
      time_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(session_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS assessment_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      weight REAL NOT NULL,
      code TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      semester_id TEXT NOT NULL,
      assessment_type_id TEXT NOT NULL,
      score REAL NOT NULL CHECK(score >= 0 AND score <= 10),
      recorded_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (semester_id) REFERENCES semesters(id),
      FOREIGN KEY (assessment_type_id) REFERENCES assessment_types(id),
      FOREIGN KEY (recorded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS conduct_events (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      points INTEGER NOT NULL, -- Positive for reward, negative for violation
      event_type TEXT NOT NULL CHECK(event_type IN ('Reward', 'Violation')),
      recorded_by TEXT NOT NULL,
      verified_by TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (recorded_by) REFERENCES users(id),
      FOREIGN KEY (verified_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS awards (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date_awarded DATE NOT NULL,
      description TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'General' CHECK(category IN ('General', 'Attendance', 'Grade', 'Event', 'System')),
      target_role TEXT, -- NULL for all, or specific role_id
      target_class_id TEXT, -- NULL for all, or specific class_id
      sender_id TEXT NOT NULL,
      priority TEXT DEFAULT 'Normal' CHECK(priority IN ('Low', 'Normal', 'High', 'Urgent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (target_class_id) REFERENCES classes(id)
    );

    CREATE TABLE IF NOT EXISTS notification_recipients (
      id TEXT PRIMARY KEY,
      notification_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      read_at DATETIME,
      FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(notification_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Performance optimization indexes
    CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
    CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
    CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class_date ON attendance_sessions(class_id, date);
    CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(session_id);
    CREATE INDEX IF NOT EXISTS idx_grades_subject_semester ON grades(subject_id, semester_id);
    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
  `);
}

export function initDatabase() {
  getDb();
}
