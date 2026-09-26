import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

export const runtime = "nodejs";

function safeParseItems(raw: unknown): unknown[] {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// GET /api/orders?email=... — returns orders for a given email using service_role.
// Auth: lightweight shared-secret check is not available for customers, so we rely on
// (a) rate limiting, (b) only returning order metadata scoped to the exact email, and
// (c) never exposing rows for other emails. Download URLs only included for approved orders.

// In-memory rate limit: 20 lookups per minute per IP (anti-enumeration/harvesting)
const rateMap = new Map<string, { count: number; reset: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 20;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return (req.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

export async function GET(req: NextRequest) {
  try {
    if (isRateLimited(getClientIp(req))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Cache-Control": "no-store" } });
    }
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, email, name, items, total, status, date, payment_method")
      .eq("email", email)
      .order("date", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[api/orders] fetch error", error.message);
      return NextResponse.json({ error: "Failed to load orders" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    const orders = (data || []).map((o) => {
      const items = safeParseItems(o.items) as Array<{ id?: string; name?: string; price?: number; img?: string; qty?: number; downloadUrl?: string | null }>;
      return {
        orderId: o.order_id,
        email: o.email,
        name: o.name,
        items: items.map((it) => ({
          id: it.id,
          name: it.name || "",
          price: it.price || 0,
          img: it.img || "",
          qty: it.qty || 1,
          // Only expose download URLs for approved orders
          downloadUrl: o.status === "approved" ? (it.downloadUrl ?? null) : null,
        })),
        total: o.total,
        status: o.status,
        date: o.date,
      };
    });

    return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
