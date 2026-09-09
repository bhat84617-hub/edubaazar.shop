import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json() as { name?: string; email?: string; password?: string };
    if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const cleanEmail = email.trim().toLowerCase();

    const { data: existing } = await supabase.from("users").select("id").eq("email", cleanEmail).single();
    if (existing) return NextResponse.json({ error: "This email is already registered. Please login." }, { status: 409 });

    const { error: insErr } = await supabase.from("users").insert([{ name: name.trim(), email: cleanEmail, password }]);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ user: { name: name.trim(), email: cleanEmail } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
export const runtime = "nodejs";
