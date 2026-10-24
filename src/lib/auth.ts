import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

// Use environment variable if present; fallback to a randomly generated secret per process start
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  roleId: string;
  roleName: string;
  email: string;
  avatarUrl?: string;
  teacherId?: string;
  studentId?: string;
  parentId?: string;
  classId?: string;
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("smart_sms_token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;

  const db = getDb();
  const user = db
    .prepare(
      `
    SELECT u.id, u.username, u.full_name as fullName, u.email, u.avatar_url as avatarUrl, u.role_id as roleId, r.name as roleName,
           t.id as teacherId, s.id as studentId, s.class_id as classId, p.id as parentId
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN teachers t ON u.id = t.user_id
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN parents p ON u.id = p.user_id
    WHERE u.id = ? AND u.is_active = 1
  `
    )
    .get(decoded.id) as any;

  if (!user) return null;

  return user;
}

export function checkRolePermission(userRole: string, allowedRoles: string[]): boolean {
  if (userRole === "role_admin") return true;
  return allowedRoles.includes(userRole);
}
