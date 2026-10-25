import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    seedDatabase(); // Ensure database is initialized & seeded
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu" }, { status: 400 });
    }

    const db = getDb();
    const user = db
      .prepare(
        `
      SELECT u.*, r.name as role_name,
             t.id as teacher_id, s.id as student_id, s.class_id, p.id as parent_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN parents p ON u.id = p.user_id
      WHERE u.username = ? AND u.is_active = 1
    `
      )
      .get(username) as any;

    if (!user) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // Record last login
    db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);

    const sessionData = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      avatarUrl: user.avatar_url,
      teacherId: user.teacher_id,
      studentId: user.student_id,
      parentId: user.parent_id,
      classId: user.class_id,
    };

    const token = signToken({ id: user.id, roleId: user.role_id });

    const response = NextResponse.json({ success: true, user: sessionData });
    response.cookies.set("smart_sms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra trên hệ thống" }, { status: 500 });
  }
}
