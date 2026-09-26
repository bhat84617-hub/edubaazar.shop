import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";
import { getProductById } from "@/lib/products";
import { getClientIp, isRateLimited } from "@/lib/security";

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
// (a) rate limiting (shared helper, Upstash-backed when configured),
// (b) only returning order metadata scoped to the exact email, and
// (c) never exposing rows for other emails. Download URLs only included for approved orders.
export async function GET(req: NextRequest) {
  try {
    if (await isRateLimited(`orders:get:${getClientIp(req)}`, 20)) {
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

// POST /api/orders — create an order SERVER-SIDE.
// Price/status/total are computed from the server catalog (never trusted from
// the client), UTR format is enforced, and duplicate UTRs are rejected.
// This lets Supabase RLS revoke ALL anon writes on orders.
export async function POST(req: NextRequest) {
  try {
    if (await isRateLimited(`orders:post:${getClientIp(req)}`, 10)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json().catch(() => null)) as {
      name?: unknown;
      email?: unknown;
      phone?: unknown;
      utr?: unknown;
      items?: unknown;
    } | null;
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const name = typeof body.name === "string" ? body.name.replace(/[\r\n<>]/g, "").trim().slice(0, 120) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
    const phoneDigits = typeof body.phone === "string" ? body.phone.replace(/\D/g, "").slice(0, 15) : "";
    const utrRaw = typeof body.utr === "string" ? body.utr.trim() : "";

    if (name.length < 2) return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit phone number." }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) {
      return NextResponse.json({ error: "Cart is empty or too large." }, { status: 400 });
    }

    // Resolve every item against the SERVER catalog — client prices are ignored
    const items: Array<{ id: string; name: string; price: number; img: string; qty: number; downloadUrl: string | null }> = [];
    for (const raw of body.items) {
      const it = raw as { id?: unknown; qty?: unknown };
      if (!it || typeof it.id !== "string") return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
      const p = getProductById(it.id.slice(0, 128));
      if (!p) return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });
      const qty = typeof it.qty === "number" && Number.isInteger(it.qty) ? Math.min(10, Math.max(1, it.qty)) : 1;
      items.push({
        id: p.id,
        name: p.title,
        price: p.price,
        img: p.images?.[0] ?? "",
        qty,
        downloadUrl: p.downloadUrl ?? null,
      });
    }
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);

    // UTR: required for paid orders (10–14 digits, same rule as checkout page)
    let utr = "";
    if (total > 0) {
      const digits = utrRaw.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 14) {
        return NextResponse.json({ error: "Please enter a valid UPI Transaction ID (10-14 digits)." }, { status: 400 });
      }
      utr = digits;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // Duplicate UTR → reject (also matches bot orders stored as "utr|tg:chatId")
    if (utr) {
      const { data: dup } = await supabase
        .from("orders")
        .select("order_id")
        .or(`utr.eq.${utr},utr.like.${utr}|%`)
        .limit(1);
      if (dup && dup.length > 0) {
        return NextResponse.json({ error: "This Transaction ID has already been used for another order." }, { status: 409 });
      }
    }

    const orderId = "EDU-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const status = total <= 0 ? "approved" : "pending";
    const date = new Date().toISOString();

    const { error: insErr } = await supabase.from("orders").insert([
      {
        order_id: orderId,
        name,
        email,
        phone: phoneDigits,
        items: JSON.stringify(items),
        total,
        status,
        payment_method: "upi_qr",
        utr,
        date,
      },
    ]);
    if (insErr) {
      console.error("[api/orders] insert error", insErr.message);
      return NextResponse.json({ error: "Order could not be saved. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      order: { orderId, name, email, phone: phoneDigits, items, total, status, paymentMethod: "upi_qr", utr, date },
    });
  } catch {
    return NextResponse.json({ error: "Order could not be saved. Please try again." }, { status: 500 });
  }
}
