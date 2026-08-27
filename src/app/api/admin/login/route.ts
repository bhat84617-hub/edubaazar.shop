import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not set in Vercel env" }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { password?: string } | null;
  if (!body?.password || body.password !== pw) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("edubazar_admin_session", createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export const runtime = "nodejs";
