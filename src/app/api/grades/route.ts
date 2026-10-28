import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "class_11a1";
    const subjectId = searchParams.get("subjectId") || "sub_math";
    const semesterId = searchParams.get("semesterId") || "sem_2_2024";

    const db = getDb();

    const students = db
      .prepare(
        `
      SELECT s.id as student_id, s.student_code, u.full_name, u.avatar_url
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ?
      ORDER BY s.student_code ASC
    `
      )
      .all(classId) as any[];

    const grades = db
      .prepare(
        `
      SELECT g.id, g.student_id, g.subject_id, g.semester_id, g.score,
             at.code as assessment_code, at.name as assessment_name, at.weight
      FROM grades g
      JOIN assessment_types at ON g.assessment_type_id = at.id
      WHERE g.subject_id = ? AND g.semester_id = ?
    `
      )
      .all(subjectId, semesterId) as any[];

    // Bolt Optimization: Group grades by student_id into a Map ahead of time.
    // This improves complexity from O(N * M) (nested filter over M grades for each of N students)
    // to O(N + M) linear lookup time, dramatically improving API response times for large classes.
    const gradesByStudentMap = new Map<string, Record<string, number>>();
    for (const g of grades) {
      let studentGrades = gradesByStudentMap.get(g.student_id);
      if (!studentGrades) {
        studentGrades = {};
        gradesByStudentMap.set(g.student_id, studentGrades);
      }
      studentGrades[g.assessment_code] = g.score;
    }

    // Map grades per student using O(1) hash map lookups
    const studentGradesMap = students.map((std) => {
      const stdGrades = gradesByStudentMap.get(std.student_id) || {};

      const txScore = stdGrades["TX"] ?? null;
      const gkScore = stdGrades["GK"] ?? null;
      const ckScore = stdGrades["CK"] ?? null;

      // Calculate weighted average
      let avg = null;
      if (txScore !== null && gkScore !== null && ckScore !== null) {
        avg = Math.round(((txScore * 1 + gkScore * 2 + ckScore * 3) / 6) * 10) / 10;
      }

      return {
        ...std,
        txScore,
        gkScore,
        ckScore,
        avgScore: avg,
      };
    });

    return NextResponse.json({ studentGrades: studentGradesMap });
  } catch (error) {
    console.error("Grades GET Error:", error);
    return NextResponse.json({ error: "Lỗi tải bảng điểm" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, subjectId, semesterId, assessmentCode, score } = body;

    if (!studentId || !subjectId || score === undefined || score < 0 || score > 10) {
      return NextResponse.json({ error: "Điểm số không hợp lệ (0.0 - 10.0)" }, { status: 400 });
    }

    const db = getDb();
    const assessmentType = db
      .prepare("SELECT id FROM assessment_types WHERE code = ?")
      .get(assessmentCode) as any;

    if (!assessmentType) {
      return NextResponse.json({ error: "Loại đánh giá không hợp lệ" }, { status: 400 });
    }

    const gradeId = `grd_${studentId}_${subjectId}_${assessmentCode.toLowerCase()}`;

    db.prepare(
      `
      INSERT INTO grades (id, student_id, subject_id, semester_id, assessment_type_id, score, recorded_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'user_admin', CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        score = excluded.score,
        updated_at = CURRENT_TIMESTAMP
    `
    ).run(gradeId, studentId, subjectId, semesterId || "sem_2_2024", assessmentType.id, score);

    return NextResponse.json({ success: true, message: "Lưu điểm thành công" });
  } catch (error: any) {
    console.error("Grade POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
