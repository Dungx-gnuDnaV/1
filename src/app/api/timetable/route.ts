import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "class_11a1";

    const db = getDb();

    // Fetch timetable slots for class
    const timetableSlots = db
      .prepare(
        `
      SELECT t.id, t.day_of_week, t.period_number, t.room,
             s.name as subject_name, s.code as subject_code,
             u.full_name as teacher_name
      FROM timetables t
      JOIN subjects s ON t.subject_id = s.id
      JOIN teachers tch ON t.teacher_id = tch.id
      JOIN users u ON tch.user_id = u.id
      WHERE t.class_id = ?
      ORDER BY t.day_of_week ASC, t.period_number ASC
    `
      )
      .all(classId);

    // If empty timetable, populate mock sample schedule for class_11a1
    if (timetableSlots.length === 0) {
      const mockSlots = [
        { day_of_week: 2, period_number: 1, subject_name: "Toán học", teacher_name: "ThS. Lê Hoàng Nam", room: "B201" },
        { day_of_week: 2, period_number: 2, subject_name: "Toán học", teacher_name: "ThS. Lê Hoàng Nam", room: "B201" },
        { day_of_week: 2, period_number: 3, subject_name: "Ngữ văn", teacher_name: "Cô Nguyễn Thu Hương", room: "B201" },
        { day_of_week: 3, period_number: 1, subject_name: "Tiếng Anh", teacher_name: "Thầy Phạm Đức Minh", room: "B201" },
        { day_of_week: 3, period_number: 2, subject_name: "Vật lý", teacher_name: "ThS. Đặng Thị Thanh", room: "B201" },
        { day_of_week: 4, period_number: 1, subject_name: "Tin học", teacher_name: "Thầy Vũ Quốc Anh", room: "Lab 01" },
      ];
      return NextResponse.json({ timetable: mockSlots, conflicts: [] });
    }

    return NextResponse.json({ timetable: timetableSlots, conflicts: [] });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải thời khóa biểu" }, { status: 500 });
  }
}
