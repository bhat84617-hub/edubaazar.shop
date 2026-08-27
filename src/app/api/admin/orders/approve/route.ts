import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

function getDb() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

function htmlResponse(body: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Admin</title></head>
  <body style="font-family:Arial,sans-serif;max-width:600px;margin:80px auto;padding:0 20px;">
    <h1 style="margin-bottom:24px;">EduBazar Admin</h1>
    ${body}
  </body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return htmlResponse("Session expired. Please <a href='/admin/login'>login again</a>.");
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return htmlResponse("No order ID provided. <a href='/admin'>Back to Admin</a>");
  }

  const db = getDb();

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

    return htmlResponse(
      `<div style="color:#28a745;font-weight:700;margin-bottom:16px;">✓ Order ${orderId} APPROVED!</div>
       <a href='/admin' style="display:inline-block;padding:12px 28px;background:#181d27;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">← Back to Admin</a>`
    );
  }

  return htmlResponse("Order not found. <a href='/admin'>Back to Admin</a>");
}

export const runtime = "nodejs";
