import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const db = getDb();
    const searchTerm = `%${q}%`;

    // 1. Search Students
    const students = db
      .prepare(
        `
      SELECT s.id, s.student_code, u.full_name, c.name as class_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE u.full_name LIKE ? OR s.student_code LIKE ? OR s.rfid_code LIKE ?
      LIMIT 5
    `
      )
      .all(searchTerm, searchTerm, searchTerm) as any[];

    // 2. Search Classes
    const classes = db
      .prepare(
        `
      SELECT c.id, c.name, c.grade_level, u.full_name as teacher_name
      FROM classes c
      LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE c.name LIKE ?
      LIMIT 3
    `
      )
      .all(searchTerm) as any[];

    // 3. Search Notifications
    const notices = db
      .prepare(
        `
      SELECT id, title, category, created_at
      FROM notifications
      WHERE title LIKE ? OR content LIKE ?
      LIMIT 3
    `
      )
      .all(searchTerm, searchTerm) as any[];

    const results = [
      ...students.map((s) => ({
        type: "student",
        title: `${s.full_name} (${s.student_code})`,
        subtitle: `Lớp ${s.class_name || "Chưa xếp lớp"}`,
        url: `/students?id=${s.id}`,
      })),
      ...classes.map((c) => ({
        type: "class",
        title: `Lớp ${c.name}`,
        subtitle: `GVCN: ${c.teacher_name || "Chưa phân công"}`,
        url: `/classes?id=${c.id}`,
      })),
      ...notices.map((n) => ({
        type: "notice",
        title: n.title,
        subtitle: `Danh mục: ${n.category}`,
        url: `/notifications?id=${n.id}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
