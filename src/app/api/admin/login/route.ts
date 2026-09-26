import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { createAdminSession } from "@/lib/admin-session";
import { getClientIp, isRateLimited } from "@/lib/security";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "bhat84617@gmail.com";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

async function getDbPassword(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await db
      .from("users")
      .select("password")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();
    if (error || !data) return null;
    return (data as { password?: string }).password ?? null;
  } catch {
    return null;
  }
}

// Rate limit for login: 5 attempts per minute per IP (shared helper)
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (await isRateLimited(`admin:login:${ip}`, 5)) {
    return NextResponse.json({ error: "Too many attempts, try later" }, { status: 429 });
  }
  const body = await request.json().catch(() => null) as { password?: string } | null;

  if (!body || typeof body.password !== "string" || body.password.length === 0 || body.password.length > 200) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const envPassword = process.env.ADMIN_PASSWORD;
  const dbPassword = await getDbPassword();

  if (!envPassword && !dbPassword) {
    return NextResponse.json({ error: "Admin password not configured" }, { status: 503 });
  }

  const ok =
    (envPassword ? safeEqual(body.password, envPassword) : false) ||
    (dbPassword ? safeEqual(body.password, dbPassword) : false);
  if (!ok) {
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