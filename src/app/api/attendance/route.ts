import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "class_11a1";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const db = getDb();

    // Get or create session
    let session = db
      .prepare("SELECT * FROM attendance_sessions WHERE class_id = ? AND date = ?")
      .get(classId, date) as any;

    if (!session) {
      const sessionId = `sess_${classId}_${date.replace(/-/g, "")}`;
      db.prepare(
        "INSERT INTO attendance_sessions (id, class_id, teacher_id, date, session_type) VALUES (?, ?, 'tch_02', ?, 'Morning')"
      ).run(sessionId, classId, date);

      session = { id: sessionId, class_id: classId, date };
    }

    // Get all students in class with their attendance records for this session
    const studentsWithAttendance = db
      .prepare(
        `
      SELECT s.id as student_id, s.student_code, s.rfid_code, u.full_name, u.avatar_url,
             ar.id as record_id, COALESCE(ar.status, 'Present') as status, ar.method, ar.time_recorded, ar.notes
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN attendance_records ar ON s.id = ar.student_id AND ar.session_id = ?
      WHERE s.class_id = ?
      ORDER BY s.student_code ASC
    `
      )
      .all(session.id, classId);

    return NextResponse.json({
      session,
      records: studentsWithAttendance,
    });
  } catch (error) {
    console.error("Attendance GET Error:", error);
    return NextResponse.json({ error: "Lỗi điểm danh" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, studentId, status, method, notes } = body;

    if (!sessionId || !studentId || !status) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const db = getDb();

    db.prepare(
      `
      INSERT INTO attendance_records (id, session_id, student_id, status, method, time_recorded, notes)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
      ON CONFLICT(session_id, student_id) DO UPDATE SET
        status = excluded.status,
        method = excluded.method,
        time_recorded = CURRENT_TIMESTAMP,
        notes = excluded.notes
    `
    ).run(`att_rec_${sessionId}_${studentId}`, sessionId, studentId, status, method || "Manual", notes || "");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Attendance POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
