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
    .select("name, email")
    .eq("order_id", orderId)
    .single();

  if (order) {
    await db
      .from("orders")
      .update({ status: "rejected" })
      .eq("order_id", orderId);

    sendOrderStatusUpdate({
      orderId,
      name: order.name,
      email: order.email,
      status: "rejected",
      downloadUrls: {},
    }).catch(() => {});
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
