import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const classId = searchParams.get("classId") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const db = getDb();
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (search) {
      whereClauses.push("(u.full_name LIKE ? OR s.student_code LIKE ? OR s.rfid_code LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (classId) {
      whereClauses.push("s.class_id = ?");
      params.push(classId);
    }

    if (status) {
      whereClauses.push("s.status = ?");
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countResult = db
      .prepare(`SELECT COUNT(*) as total FROM students s JOIN users u ON s.user_id = u.id ${whereSql}`)
      .get(...params) as any;

    const students = db
      .prepare(
        `
      SELECT s.id, s.student_code, s.dob, s.gender, s.address, s.status, s.rfid_code, s.class_id,
             u.full_name, u.email, u.phone, u.avatar_url,
             c.name as class_name, c.grade_level,
             p.id as parent_id, pu.full_name as parent_name, pu.phone as parent_phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN parent_student_links psl ON s.id = psl.student_id AND psl.is_primary = 1
      LEFT JOIN parents p ON psl.parent_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      ${whereSql}
      ORDER BY s.student_code ASC
      LIMIT ? OFFSET ?
    `
      )
      .all(...params, limit, offset);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    });
  } catch (error) {
    console.error("Students API Error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách học sinh" }, { status: 500 });
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
    const { fullName, studentCode, dob, gender, classId, rfidCode, address, parentName, parentPhone } = body;

    if (!fullName || !studentCode || !dob) {
      return NextResponse.json({ error: "Họ tên, mã học sinh và ngày sinh là bắt buộc" }, { status: 400 });
    }

    const db = getDb();

    db.transaction(() => {
      const userId = `user_std_${Date.now()}`;
      const studentId = `std_${Date.now()}`;
      const username = `hocsinh_${studentCode.toLowerCase()}`;
      const email = `${studentCode.toLowerCase()}@hocsinh.smart-sms.edu.vn`;

      // Insert User
      db.prepare(
        `INSERT INTO users (id, username, email, password_hash, full_name, role_id, avatar_url)
         VALUES (?, ?, ?, ?, ?, 'role_student', ?)`
      ).run(
        userId,
        username,
        email,
        "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // default pw: 123456
        fullName,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentCode}`
      );

      // Insert Student
      db.prepare(
        `INSERT INTO students (id, user_id, student_code, dob, gender, address, class_id, status, rfid_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)`
      ).run(studentId, userId, studentCode, dob, gender || "Male", address || "", classId || null, rfidCode || null);

      // Link Parent if provided
      if (parentName) {
        const pUserId = `user_prt_${Date.now()}`;
        const pId = `prt_${Date.now()}`;
        db.prepare(
          `INSERT INTO users (id, username, email, password_hash, full_name, phone, role_id)
           VALUES (?, ?, ?, ?, ?, ?, 'role_parent')`
        ).run(pUserId, `phuhyenh_${studentCode.toLowerCase()}`, `ph_${studentCode.toLowerCase()}@gmail.com`, "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", parentName, parentPhone || "");

        db.prepare(`INSERT INTO parents (id, user_id) VALUES (?, ?)`).run(pId, pUserId);
        db.prepare(`INSERT INTO parent_student_links (id, parent_id, student_id, relationship) VALUES (?, ?, ?, 'Bố / Mẹ')`).run(`link_${Date.now()}`, pId, studentId);
      }
    })();

    return NextResponse.json({ success: true, message: "Thêm học sinh thành công" });
  } catch (error: any) {
    console.error("Create Student Error:", error);
    return NextResponse.json({ error: error.message || "Không thể tạo hồ sơ học sinh" }, { status: 500 });
  }
}
