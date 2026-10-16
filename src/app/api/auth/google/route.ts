import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";
import { getClientIp, isRateLimited } from "@/lib/security";
import { unusablePassword } from "@/lib/password";

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const runtime = "nodejs";

// POST /api/auth/google — complete a Google OAuth login.
// The client sends the Supabase access_token it received from the OAuth flow.
// The server verifies the token with Supabase (never trusts the client), then
// creates or fetches the matching row in our own `users` table and returns the
// app user. Google users get an unusable password hash — password login is
// impossible for them; they must always use Google.
export async function POST(req: NextRequest) {
  try {
    if (await isRateLimited(`auth:google:${getClientIp(req)}`, 10)) {
      return NextResponse.json({ error: "Too many attempts. Please try again in a minute." }, { status: 429 });
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Google login is not configured yet." }, { status: 503 });
    }

    const body = (await req.json().catch(() => null)) as { access_token?: unknown } | null;
    const accessToken = typeof body?.access_token === "string" ? body.access_token : "";
    if (!accessToken || accessToken.length > 4096) {
      return NextResponse.json({ error: "Missing Google session." }, { status: 400 });
    }

    // Verify the token with Supabase — this is the security anchor.
    const verifier = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: { user: sbUser }, error: verifyErr } = await verifier.auth.getUser(accessToken);
    if (verifyErr || !sbUser || !sbUser.email) {
      return NextResponse.json({ error: "Google session verify nahi ho payi. Dobara try karein." }, { status: 401 });
    }
    const email = sbUser.email.trim().toLowerCase();
    // Name from Google profile metadata, fallback to email prefix
    const rawName =
      (sbUser.user_metadata?.full_name as string | undefined) ||
      (sbUser.user_metadata?.name as string | undefined) ||
      email.split("@")[0];
    const name = rawName.trim().slice(0, 120) || "EduBazar User";

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: existing } = await db.from("users").select("name, email").eq("email", email).maybeSingle();

    if (existing) {
      const row = existing as { name?: string; email?: string };
      return NextResponse.json({ user: { name: row.name || name, email: row.email || email } });
    }

    const { error: insErr } = await db.from("users").insert([{ name, email, password: unusablePassword() }]);
    if (insErr) {
      return NextResponse.json({ error: "Account banate waqt error aaya. Dobara try karein." }, { status: 500 });
    }
    return NextResponse.json({ user: { name, email } });
  } catch {
    return NextResponse.json({ error: "Google login failed. Please try again." }, { status: 500 });
  }
}
