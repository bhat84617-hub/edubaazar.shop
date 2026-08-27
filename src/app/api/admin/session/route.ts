import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSession } from "@/lib/admin-session";

export async function GET(request: NextRequest) {
  const valid = isValidAdminSession(request.cookies.get("edubazar_admin_session")?.value);
  return NextResponse.json({ authenticated: valid }, { status: valid ? 200 : 401 });
}

export const runtime = "nodejs";