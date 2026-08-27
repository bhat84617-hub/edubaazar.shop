import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";
import { sendOrderStatusUpdate } from "@/lib/email";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "No order ID provided" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data: order } = await db
    .from("orders")
    .select("name, email, items, status, utr")
    .eq("order_id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json({ error: "Only pending requests can be approved" }, { status: 409 });
  }

  // Get download URLs from query parameters
  const downloadUrlsParam = request.nextUrl.searchParams.get("downloadUrls");
  let downloadUrls: Record<string, string> = {};
  if (downloadUrlsParam) {
    try {
      downloadUrls = JSON.parse(decodeURIComponent(downloadUrlsParam));
    } catch (e) {
      return NextResponse.json({ error: "Invalid download URLs format" }, { status: 400 });
    }
  }

  // Parse items
  const items = (typeof order.items === "string" ? JSON.parse(order.items) : order.items) as Array<{ id: string; name?: string; downloadUrl?: string | null }>;

  // Update order status and download URLs
  const update: Record<string, unknown> = { status: "approved" };

  const updatedItems = items.map(item => {
    const key = item.id || item.name;
    return { ...item, downloadUrl: downloadUrls[key] || item.downloadUrl || "" };
  });
  update.items = JSON.stringify(updatedItems);

  const { error: updateError } = await db
    .from("orders")
    .update(update)
    .eq("order_id", orderId)
    .eq("status", "pending");

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send notification with download URLs
  const downloadMap = Object.fromEntries(updatedItems.map((i) => [i.name || i.id, i.downloadUrl || ""]));
  sendOrderStatusUpdate({
    orderId: orderId,
    name: order.name,
    email: order.email,
    status: "approved",
    downloadUrls: downloadMap,
  }).catch(() => {});

  return NextResponse.json({ success: true, message: "Order approved and download links sent to customer" });
}
