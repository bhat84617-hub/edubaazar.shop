import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";
import { sendOrderStatusUpdate } from "@/lib/email";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function toOrder(order: Record<string, unknown>) {
  return {
    orderId: order.order_id,
    name: order.name,
    email: order.email,
    phone: order.phone,
    items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
    total: order.total,
    status: order.status,
    paymentMethod: order.payment_method,
    utr: order.utr ?? "",
    date: order.date,
  };
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const client = getAdminSupabase();
  if (!client) {
    return NextResponse.json({ error: "Server payment database is not configured" }, { status: 503 });
  }

  const { data, error } = await client.from("orders").select("*").order("date", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
  return NextResponse.json({ orders: (data || []).map((order) => toOrder(order)) });
}

export async function PATCH(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    orderId?: string;
    status?: "approved" | "rejected";
    downloadUrls?: Record<string, string>;
  } | null;
  if (!body?.orderId || !body.status) {
    return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
  }

  const client = getAdminSupabase();
  if (!client) {
    return NextResponse.json({ error: "Server payment database is not configured" }, { status: 503 });
  }

  const { data: order, error: readError } = await client
    .from("orders")
    .select("name, email, items, status")
    .eq("order_id", body.orderId)
    .single();
  if (readError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const update: Record<string, unknown> = { status: body.status };
  const items = (typeof order.items === "string" ? JSON.parse(order.items) : order.items) as Array<{ id: string; name?: string; downloadUrl?: string | null }>;

  if (body.status === "approved") {
    const urls = body.downloadUrls || {};
    if (!items?.length || items.some((item) => !/^https?:\/\//i.test(urls[item.id] || item.downloadUrl || ""))) {
      return NextResponse.json({ error: "A valid course link is required for every item" }, { status: 400 });
    }
    update.items = JSON.stringify(items.map((item) => ({ ...item, downloadUrl: urls[item.id] || item.downloadUrl })));
  }

  const { error: updateError } = await client.from("orders").update(update).eq("order_id", body.orderId);
  if (updateError) {
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }

  const downloadUrls = Object.fromEntries(
    items.map((item) => [
      item.name || item.id,
      item.downloadUrl || "",
    ])
  );
  await sendOrderStatusUpdate({
    orderId: body.orderId,
    name: order.name,
    email: order.email,
    status: body.status,
    downloadUrls,
  });

  return NextResponse.json({ ok: true });
}
