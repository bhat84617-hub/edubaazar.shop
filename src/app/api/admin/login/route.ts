import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD || "Admin@123";

  const body = await request.json().catch(() => null) as { password?: string } | null;
  if (!body?.password || body.password !== pw) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("edubazar_admin_session", createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export const runtime = "nodejs";
