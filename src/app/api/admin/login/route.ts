import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";

const FALLBACK_PASSWORD = "Admin@123";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { password?: string } | null;

  if (!body?.password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD;

  if (body.password !== expected) {
    return NextResponse.json({ error: "Galat password" }, { status: 401 });
  }

  const token = createAdminSession();

  const res = NextResponse.json({ ok: true });
  res.cookies.set("edubazar_admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export const runtime = "nodejs";