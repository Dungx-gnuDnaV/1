import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare("SELECT key, value, description FROM system_settings").all();
    const logs = db
      .prepare(
        `
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.details, al.created_at,
             u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 20
    `
      )
      .all();

    return NextResponse.json({ settings, logs });
  } catch (error) {
    return NextResponse.json({ settings: [], logs: [] }, { status: 500 });
  }
}
