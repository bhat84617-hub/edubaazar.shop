import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";
import { getClientIp, isRateLimited } from "@/lib/security";
import { hashPassword, verifyPassword, needsUpgrade } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (await isRateLimited(`auth:login:${ip}`, 10)) {
      return NextResponse.json({ error: "Too many attempts. Please try again in a minute." }, { status: 429 });
    }

    const { email, password } = await req.json() as { email?: string; password?: string };
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }
    if (email.length > 254 || password.length > 200) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase.from("users").select("name, email, password").eq("email", email.trim().toLowerCase()).single();

    if (error || !data || !data.password || !verifyPassword(data.password, password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Opportunistic upgrade: rehash legacy SHA-256 / plaintext passwords to scrypt
    if (needsUpgrade(data.password)) {
      try {
        await supabase.from("users").update({ password: hashPassword(password) }).eq("email", data.email);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ user: { name: data.name, email: data.email } });
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
export const runtime = "nodejs";
