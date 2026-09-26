import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual, scryptSync, randomBytes } from "node:crypto";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";
import { getClientIp, isRateLimited } from "@/lib/security";

function hashLegacy(password: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function hashScrypt(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function hashNew(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${hashScrypt(password, salt)}`;
}

function verifyPassword(stored: string, password: string): boolean {
  // Current format: scrypt:<salt-hex>:<hash-hex>
  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3 || !/^[0-9a-f]{32}$/i.test(parts[1]) || !/^[0-9a-f]{128}$/i.test(parts[2])) return false;
    const actual = hashScrypt(password, parts[1]);
    const a = Buffer.from(parts[2], "hex");
    const b = Buffer.from(actual, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  // Legacy format: <salt-hex>:<sha256-hex>
  const sep = stored.indexOf(":");
  if (sep > 0 && /^[0-9a-f]{32}$/i.test(stored.slice(0, sep)) && /^[0-9a-f]{64}$/i.test(stored.slice(sep + 1))) {
    const salt = stored.slice(0, sep);
    const expected = stored.slice(sep + 1);
    const actual = hashLegacy(password, salt);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(actual, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  // Oldest legacy: plaintext (migrated on next successful login)
  const a = Buffer.from(stored, "utf8");
  const b = Buffer.from(password, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function needsUpgrade(stored: string): boolean {
  return !stored.startsWith("scrypt:");
}

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
        await supabase.from("users").update({ password: hashNew(password) }).eq("email", data.email);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ user: { name: data.name, email: data.email } });
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
export const runtime = "nodejs";
