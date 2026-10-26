import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: session });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("smart_sms_token");
  return response;
}
