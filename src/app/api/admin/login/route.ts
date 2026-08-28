import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "Admin@123";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { password?: string } | null;

  if (!body?.password || body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Galat password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("edubazar_admin_session", "valid_admin_session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export const runtime = "nodejs";
