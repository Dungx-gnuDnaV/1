import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const notifications = db
      .prepare(
        `
      SELECT id, title, content, category, priority, created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 10
    `
      )
      .all();

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}
