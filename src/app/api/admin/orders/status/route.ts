import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";
import { sendOrderStatusUpdate } from "@/lib/email";
import { getProductById } from "@/lib/products";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function safeParseItems(raw: unknown): Array<Record<string, unknown>> {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x === "object");
  } catch {
    return [];
  }
}

function safeHttpUrl(u: string): string | null {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

function toOrder(o: Record<string, unknown>) {
  return {
    orderId: o.order_id,
    name: o.name,
    email: o.email,
    phone: o.phone,
    items: safeParseItems(o.items),
    total: o.total,
    status: o.status,
    paymentMethod: o.payment_method,
    utr: o.utr ?? "",
    date: o.date,
  };
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await db.from("orders").select("*").order("date", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  return NextResponse.json({ orders: (data || []).map(toOrder) });
}

export async function PATCH(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    orderId?: string;
    status?: "approved" | "rejected";
    downloadUrls?: Record<string, string>;
  } | null;

  if (!body?.orderId || !body.status || !["approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "orderId and status required" }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data: order, error: readErr } = await db
    .from("orders")
    .select("name, email, items, status")
    .eq("order_id", body.orderId)
    .single();

  if (readErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json({ error: "Only pending requests can be changed" }, { status: 409 });
  }

  const update: Record<string, unknown> = { status: body.status };
  const items = safeParseItems(order.items) as Array<{ id: string; name?: string; downloadUrl?: string | null }>;
  let updatedItems = items;

  if (body.status === "approved") {
      const urls = body.downloadUrls || {};
      updatedItems = items.map((item) => {
        // Priority: 1. Admin provided URL, 2. Existing item downloadUrl, 3. Product's downloadUrl, 4. Empty string
        // All URLs validated to http(s) only — blocks javascript:/data: persistence (stored-XSS)
        const adminUrl = urls[item.id]?.trim() || (item.name ? (urls[item.name]?.trim() ?? "") : "");
        const productDefault = getProductById(item.id)?.downloadUrl ?? "";
        const finalUrl = safeHttpUrl(adminUrl) ?? safeHttpUrl(item.downloadUrl || "") ?? safeHttpUrl(productDefault) ?? "";
        return { ...item, downloadUrl: finalUrl };
      });
      update.items = JSON.stringify(updatedItems);
    }

  const { error: updateErr } = await db
    .from("orders")
    .update(update)
    .eq("order_id", body.orderId)
    .eq("status", "pending");

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  // Build download map for email - only include valid URLs
  const downloadMap = Object.fromEntries(
    updatedItems
      .filter((i) => i.downloadUrl && i.downloadUrl.startsWith("http"))
      .map((i) => [i.name || i.id, i.downloadUrl!])
  );
  
  sendOrderStatusUpdate({
    orderId: body.orderId,
    name: order.name,
    email: order.email,
    status: body.status,
    downloadUrls: downloadMap,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
