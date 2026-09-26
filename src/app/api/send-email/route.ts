import { NextRequest, NextResponse } from "next/server";
import { sendSignupEmail, sendOrderConfirmation, sendOrderStatusUpdate } from "@/lib/email";
import { isValidAdminSession } from "@/lib/admin-session";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

// Simple in-memory rate limit: 10 requests per minute per IP
// + per-target cooldowns to stop inbox-flooding / Resend-budget burn
const rateMap = new Map<string, { count: number; reset: number }>();
const emailCooldown = new Map<string, number>(); // target email -> timestamp
const orderCooldown = new Map<string, number>(); // orderId -> timestamp
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}
function isCoolingDown(map: Map<string, number>, key: string, ms: number): boolean {
  const now = Date.now();
  const last = map.get(key) || 0;
  if (now - last < ms) return true;
  map.set(key, now);
  return false;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const bodyPreview = await req.json().catch(() => null);
  const typePreview = (bodyPreview as { type?: string } | null)?.type;
  if (typePreview === "order-status") {
    const session = req.cookies.get("edubazar_admin_session")?.value;
    if (!isValidAdminSession(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    const body = bodyPreview;
    const { type } = (body as { type?: string }) || {};

    if (type === "signup") {
      const { name, email } = body as { name?: string; email?: string };
      if (!name || !email || typeof name !== "string" || typeof email !== "string") {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const cleanName = name.replace(/[\r\n<>]/g, "").trim().slice(0, 120);
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanName || cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
      }
      // One welcome mail per address per 10 min — stops spam/budget burn
      if (isCoolingDown(emailCooldown, `signup:${cleanEmail}`, 10 * 60_000)) {
        return NextResponse.json({ ok: true });
      }
      await sendSignupEmail(cleanName, cleanEmail);
      return NextResponse.json({ ok: true });
    }

    if (type === "order") {
      // Look up the order server-side — never trust client-supplied name/email/items/total/downloadUrls.
      const { orderId } = body as { orderId?: string };
      if (!orderId || typeof orderId !== "string" || orderId.length > 64 || !/^EDU-[A-Z0-9-]+$/i.test(orderId.trim())) {
        return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
      }
      // One confirmation burst per order per 10 min — stops email-bombing via guessed IDs
      if (isCoolingDown(orderCooldown, `order:${orderId.trim().toUpperCase()}`, 10 * 60_000)) {
        return NextResponse.json({ ok: true });
      }
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
      const { data: order, error } = await supabase
        .from("orders")
        .select("order_id, name, email, total, utr, items")
        .eq("order_id", orderId)
        .maybeSingle();
      if (error || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      let items: Array<{ name?: string; price?: number; qty?: number; downloadUrl?: string }> = [];
      try {
        const parsed = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        if (Array.isArray(parsed)) items = parsed;
      } catch { items = []; }
      const downloadUrls: Record<string, string> = {};
      for (const it of items) {
        if (it?.downloadUrl && typeof it.downloadUrl === "string" && /^https?:\/\//.test(it.downloadUrl)) {
          downloadUrls[String((it as { id?: string }).id ?? it.name ?? "")] = it.downloadUrl;
        }
      }
      await sendOrderConfirmation({
        orderId: order.order_id,
        name: order.name,
        email: order.email,
        items: items.map((it) => ({ name: it.name || "Course", price: it.price || 0, qty: typeof it.qty === "number" && it.qty > 0 ? it.qty : 1 })),
        total: order.total,
        utr: order.utr,
        downloadUrls,
      });
      return NextResponse.json({ ok: true });
    }

    if (type === "order-status") {
      const { orderId, name, email, status, downloadUrls } = body;
      if (!orderId || !name || !email || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      if (typeof orderId !== "string" || typeof name !== "string" || typeof email !== "string" || typeof status !== "string") {
        return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
      }
      const cleanOrderId = orderId.replace(/[\r\n]/g, "").trim().slice(0, 64);
      const cleanName = name.replace(/[\r\n<>]/g, "").trim().slice(0, 120);
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanOrderId || !cleanName || cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
      }
      if (status !== "approved" && status !== "rejected") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const cleanUrls: Record<string, string> = {};
      if (downloadUrls && typeof downloadUrls === "object") {
        for (const [k, v] of Object.entries(downloadUrls as Record<string, unknown>)) {
          if (typeof v === "string" && /^https?:\/\//.test(v) && k.length <= 200 && v.length <= 2000) {
            cleanUrls[String(k).slice(0, 200)] = v.slice(0, 2000);
          }
        }
      }
      await sendOrderStatusUpdate({ orderId: cleanOrderId, name: cleanName, email: cleanEmail, status, downloadUrls: cleanUrls });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
