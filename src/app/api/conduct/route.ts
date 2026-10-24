import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "class_11a1";

    const db = getDb();

    // 1. Conduct Events Log
    const events = db
      .prepare(
        `
      SELECT ce.id, ce.title, ce.description, ce.points, ce.event_type, ce.is_verified, ce.created_at,
             s.student_code, u.full_name as student_name, ru.full_name as recorder_name
      FROM conduct_events ce
      JOIN students s ON ce.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN users ru ON ce.recorded_by = ru.id
      WHERE ce.class_id = ?
      ORDER BY ce.created_at DESC
    `
      )
      .all(classId);

    // 2. Class Leaderboard Standing
    const standings = db
      .prepare(
        `
      SELECT c.id, c.name,
             COUNT(DISTINCT s.id) as student_count,
             COALESCE(SUM(ce.points), 0) as total_points
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      LEFT JOIN conduct_events ce ON s.id = ce.student_id
      GROUP BY c.id
      ORDER BY total_points DESC
    `
      )
      .all();

    // 3. Awards
    const awards = db
      .prepare(
        `
      SELECT a.id, a.title, a.category, a.date_awarded, a.description,
             s.student_code, u.full_name as student_name
      FROM awards a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY a.date_awarded DESC
    `
      )
      .all();

    return NextResponse.json({ events, standings, awards });
  } catch (error) {
    console.error("Conduct API Error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu thi đua" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const allowedRoles = ["role_admin", "role_teacher", "role_principal"];
    if (!allowedRoles.includes(session.roleId)) {
      return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, classId, title, description, points, eventType } = body;

    if (!studentId || !classId || !title || !points) {
      return NextResponse.json({ error: "Thiếu thông tin sự kiện thi đua" }, { status: 400 });
    }

    const db = getDb();
    const eventId = `cnd_${Date.now()}`;

    db.prepare(
      `
      INSERT INTO conduct_events (id, student_id, class_id, title, description, points, event_type, recorded_by, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `
    ).run(eventId, studentId, classId, title, description || "", points, eventType || (points >= 0 ? "Reward" : "Violation"), session.id);

    return NextResponse.json({ success: true, message: "Ghi nhận thi đua thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
