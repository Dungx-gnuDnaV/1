import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rfidCode, classId } = body;

    if (!rfidCode) {
      return NextResponse.json({ error: "Mã RFID không hợp lệ" }, { status: 400 });
    }

    const db = getDb();

    // Find student by RFID
    const student = db
      .prepare(
        `
      SELECT s.id as student_id, s.class_id, s.student_code, u.full_name, c.name as class_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.rfid_code = ?
    `
      )
      .get(rfidCode) as any;

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          unregistered: true,
          message: `Thẻ RFID [${rfidCode}] chưa được đăng ký trong hệ thống nhà trường!`,
        },
        { status: 404 }
      );
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const targetClassId = classId || student.class_id;

    // Get session
    let session = db
      .prepare("SELECT * FROM attendance_sessions WHERE class_id = ? AND date = ?")
      .get(targetClassId, todayStr) as any;

    if (!session) {
      const sessionId = `sess_${targetClassId}_${todayStr.replace(/-/g, "")}`;
      db.prepare(
        "INSERT INTO attendance_sessions (id, class_id, teacher_id, date, session_type) VALUES (?, ?, 'tch_02', ?, 'Morning')"
      ).run(sessionId, targetClassId, todayStr);
      session = { id: sessionId };
    }

    // Check duplicate scan within session
    const existing = db
      .prepare("SELECT * FROM attendance_records WHERE session_id = ? AND student_id = ?")
      .get(session.id, student.student_id) as any;

    if (existing && existing.status === "Present" && existing.method === "RFID") {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: `Học sinh ${student.full_name} (${student.student_code}) đã quét thẻ điểm danh trước đó lúc ${existing.time_recorded}`,
        student,
      });
    }

    // Record attendance
    db.prepare(
      `
      INSERT INTO attendance_records (id, session_id, student_id, status, method, time_recorded, notes)
      VALUES (?, ?, ?, 'Present', 'RFID', CURRENT_TIMESTAMP, 'Quét thẻ RFID tự động')
      ON CONFLICT(session_id, student_id) DO UPDATE SET
        status = 'Present',
        method = 'RFID',
        time_recorded = CURRENT_TIMESTAMP,
        notes = 'Quét thẻ RFID tự động'
    `
    ).run(`att_rec_${session.id}_${student.student_id}`, session.id, student.student_id);

    return NextResponse.json({
      success: true,
      duplicate: false,
      message: `Xác nhận điểm danh THÀNH CÔNG cho ${student.full_name} (Lớp ${student.class_name})`,
      student,
    });
  } catch (error: any) {
    console.error("RFID Scan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
