import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scryptSync, randomBytes } from "node:crypto";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";
import { getClientIp, isRateLimited } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (await isRateLimited(`auth:register:${ip}`, 5)) {
      return NextResponse.json({ error: "Too many attempts. Please try again in a minute." }, { status: 429 });
    }

    const { name, email, password } = await req.json() as { name?: string; email?: string; password?: string };
    if (!name || !email || !password || typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (name.trim().length < 2 || name.length > 120) {
      return NextResponse.json({ error: "Please enter a valid name (2-120 characters)." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 200) {
      return NextResponse.json({ error: "Password must be 8-200 characters." }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const cleanEmail = email.trim().toLowerCase();

    const { data: existing } = await supabase.from("users").select("id").eq("email", cleanEmail).single();
    // No 409 oracle: existing emails get the same 200 shape so accounts can't
    // be enumerated by status code. Frontend redirects to login instead.
    if (existing) return NextResponse.json({ ok: true, alreadyRegistered: true });

    // Strong password hashing: scrypt (CPU+memory hard). Format: scrypt:<salt>:<hash>
    const salt = randomBytes(16).toString("hex");
    const derived = scryptSync(password, salt, 64).toString("hex");
    const stored = `scrypt:${salt}:${derived}`;

    const { error: insErr } = await supabase.from("users").insert([{ name: name.trim(), email: cleanEmail, password: stored }]);
    if (insErr) {
      return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ user: { name: name.trim(), email: cleanEmail } });
  } catch {
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
export const runtime = "nodejs";
