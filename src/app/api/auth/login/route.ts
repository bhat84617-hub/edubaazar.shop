import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string };
    if (!email || !password) return NextResponse.json({ error: "Missing email or password" }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase.from("users").select("name, email").eq("email", email.trim().toLowerCase()).eq("password", password).single();

    if (error || !data) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    return NextResponse.json({ user: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
export const runtime = "nodejs";
