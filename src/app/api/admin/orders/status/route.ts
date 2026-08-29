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

function toOrder(o: Record<string, unknown>) {
  return {
    orderId: o.order_id,
    name: o.name,
    email: o.email,
    phone: o.phone,
    items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
  const items = (typeof order.items === "string" ? JSON.parse(order.items) : order.items) as Array<{ id: string; name?: string; downloadUrl?: string | null }>;
  let updatedItems = items;

  if (body.status === "approved") {
    const urls = body.downloadUrls || {};
    updatedItems = items.map((item) => {
      const adminUrl = urls[item.id]?.trim() || (item.name ? (urls[item.name]?.trim() ?? "") : "");
      // fallback: item already has a downloadUrl, else look up product, else dashboard
      const productDefault = getProductById(item.id)?.downloadUrl ?? "";
      const finalUrl = adminUrl || item.downloadUrl || productDefault || "https://www.edubaazar.shop/account";
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
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const downloadMap = Object.fromEntries(updatedItems.map((i) => [i.name || i.id, i.downloadUrl || ""]));
  sendOrderStatusUpdate({
    orderId: body.orderId,
    name: order.name,
    email: order.email,
    status: body.status,
    downloadUrls: downloadMap,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
