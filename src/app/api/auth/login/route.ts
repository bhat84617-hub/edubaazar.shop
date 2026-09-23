import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

const rateMap = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function verifyPassword(stored: string, password: string): boolean {
  const sep = stored.indexOf(":");
  if (sep > 0 && /^[0-9a-f]{32}$/i.test(stored.slice(0, sep)) && /^[0-9a-f]{64}$/i.test(stored.slice(sep + 1))) {
    const salt = stored.slice(0, sep);
    const expected = stored.slice(sep + 1);
    const actual = hashPassword(password, salt);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(actual, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const a = Buffer.from(stored, "utf8");
  const b = Buffer.from(password, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (rateLimited(ip)) {
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

    // Opportunistic upgrade: rehash legacy plaintext passwords
    if (!data.password.includes(":")) {
      try {
        const salt = createHash("sha256").update(`${email}:${Date.now()}`).digest("hex").slice(0, 32);
        await supabase.from("users").update({ password: `${salt}:${hashPassword(password, salt)}` }).eq("email", data.email);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ user: { name: data.name, email: data.email } });
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
export const runtime = "nodejs";
