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
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const db = getDb();
  if (!db) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const { data: order } = await db
    .from("orders")
    .select("name, email, items")
    .eq("order_id", orderId)
    .single();

  if (order) {
    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    const updatedItems = items.map((item: { id: string; name?: string; downloadUrl?: string | null }) => ({ ...item, downloadUrl: item.downloadUrl || "" }));

    await db
      .from("orders")
      .update({ status: "approved", items: JSON.stringify(updatedItems) })
      .eq("order_id", orderId);

    const downloadMap = Object.fromEntries(updatedItems.map((i: { name?: string; id: string; downloadUrl?: string | null }) => [i.name || i.id, i.downloadUrl || ""]));
    sendOrderStatusUpdate({
      orderId,
      name: order.name,
      email: order.email,
      status: "approved",
      downloadUrls: downloadMap,
    }).catch(() => {});
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
