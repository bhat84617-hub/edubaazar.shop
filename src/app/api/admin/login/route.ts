import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  try {
    const envPassword = process.env.ADMIN_PASSWORD;
    const defaultPassword = "Admin@123";
    const pw = envPassword || defaultPassword;
    
    console.log("[LOGIN DEBUG]", {
      envPasswordSet: !!envPassword,
      usingPassword: pw === envPassword ? "ENV_VAR" : "DEFAULT",
      passwordValue: pw
    });

    const body = await request.json().catch(() => null) as { password?: string } | null;
    const submittedPassword = body?.password;
    
    console.log("[LOGIN DEBUG]", {
      submittedPassword,
      expectedPassword: pw,
      match: submittedPassword === pw
    });

    if (!body?.password || body.password !== pw) {
      return NextResponse.json({ 
        error: "Wrong password",
        debug: {
          submittedEmpty: !body?.password,
          passwordMatch: body?.password === pw,
          envVarSet: !!envPassword
        }
      }, { status: 401 });
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
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json({ error: "Server error during login" }, { status: 500 });
  }
}

export const runtime = "nodejs";
