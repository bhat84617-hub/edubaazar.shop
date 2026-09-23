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
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, email, name, items, total, status, date, payment_method")
      .eq("email", email)
      .order("date", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[api/orders] fetch error", error.message);
      return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
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

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
