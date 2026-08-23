import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });

  const body = await request.json().catch(() => null) as { password?: string } | null;
  if (!body?.password || body.password !== configuredPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("edubazar_admin_session", createAdminSession(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}