import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const classes = db
      .prepare(
        `
      SELECT c.id, c.name, c.grade_level, c.room_number, c.student_count,
             u.full_name as homeroom_teacher_name, t.id as teacher_id
      FROM classes c
      LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY c.grade_level ASC, c.name ASC
    `
      )
      .all();

    return NextResponse.json({ classes });
  } catch (error) {
    return NextResponse.json({ classes: [] }, { status: 500 });
  }
}
