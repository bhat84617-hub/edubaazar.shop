import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";
import { getProductById } from "@/lib/products";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function htmlResponse(body: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Admin</title></head>
  <body style="font-family:Arial,sans-serif;max-width:600px;margin:80px auto;padding:0 20px;">
    <h1 style="margin-bottom:24px;">EduBazar Admin</h1>
    ${body}
  </body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function doApprove(orderId: string) {
  const db = getDb();
  if (!db) return { error: "Database not configured." };
  const { data: order } = await db.from("orders").select("name, email, items").eq("order_id", orderId).single();
  if (!order) return { error: "Order not found." };
  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  const updatedItems = (items as { id: string; name?: string; downloadUrl?: string | null }[]).map((item) => {
    const productDefault = getProductById(item.id)?.downloadUrl ?? "";
    const finalUrl = item.downloadUrl || productDefault || "";
    return { ...item, downloadUrl: finalUrl };
  });
  await db.from("orders").update({ status: "approved", items: JSON.stringify(updatedItems) }).eq("order_id", orderId);
  return { ok: true };
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return htmlResponse("Session expired. Please <a href='/admin/login'>login again</a>.");
  }
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) return htmlResponse("No order ID provided. <a href='/admin'>Back to Admin</a>");
  // Show confirmation form - state change requires POST (CSRF protection)
  const esc = orderId.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return htmlResponse(
    `<p>Approve order <strong>${esc}</strong>?</p>
     <form method="POST" action="/api/admin/orders/approve">
       <input type="hidden" name="orderId" value="${esc}" />
       <button type="submit" style="padding:12px 28px;background:#28a745;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;">✓ Confirm Approve</button>
       <a href='/admin' style="margin-left:12px;padding:12px 28px;background:#6c757d;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Cancel</a>
     </form>`
  );
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return htmlResponse("Session expired. Please <a href='/admin/login'>login again</a>.");
  }
  let orderId: string | null = null;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null) as { orderId?: string } | null;
    orderId = body?.orderId || null;
  } else {
    const form = await request.formData().catch(() => null);
    orderId = (form?.get("orderId") as string) || request.nextUrl.searchParams.get("orderId");
  }
  if (!orderId) return htmlResponse("No order ID provided. <a href='/admin'>Back to Admin</a>");
  const result = await doApprove(orderId);
  if ((result as { error?: string }).error) return htmlResponse(`${(result as { error: string }).error} <a href='/admin'>Back to Admin</a>`);
  const esc = orderId.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return htmlResponse(
    `<div style="color:#28a745;font-weight:700;margin-bottom:16px;">✓ Order ${esc} APPROVED!</div>
     <a href='/admin' style="display:inline-block;padding:12px 28px;background:#181d27;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">← Back to Admin</a>`
  );
}

export const runtime = "nodejs";
