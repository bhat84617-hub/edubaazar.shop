import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "https://edubaazar.shop"));
  response.cookies.set("edubazar_admin_session", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("edubazar_admin_session", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}

export const runtime = "nodejs";
