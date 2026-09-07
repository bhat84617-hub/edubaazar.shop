import { NextRequest, NextResponse } from "next/server";
import { sendSignupEmail, sendOrderConfirmation, sendOrderStatusUpdate } from "@/lib/email";
import { isValidAdminSession } from "@/lib/admin-session";

// Simple in-memory rate limit: 10 requests per minute per IP
const rateMap = new Map<string, { count: number; reset: number }>();
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // Require admin session for order/order-status, allow signup only with basic throttling
  const bodyPreview = await req.json().catch(() => null);
  const typePreview = (bodyPreview as { type?: string } | null)?.type;
  // order-status is admin-only; order/signup are rate-limited but public (checkout flow)
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
      const { name, email } = body;
      if (!name || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      await sendSignupEmail(name, email);
      return NextResponse.json({ ok: true });
    }

    if (type === "order") {
      const { orderId, name, email, items, total, utr, downloadUrls } = body;
      if (!orderId || !name || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      await sendOrderConfirmation({ orderId, name, email, items: items || [], total: total || 0, utr, downloadUrls: downloadUrls || {} });
      return NextResponse.json({ ok: true });
    }

    if (type === "order-status") {
      const { orderId, name, email, status, downloadUrls } = body;
      if (!orderId || !name || !email || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      await sendOrderStatusUpdate({ orderId, name, email, status, downloadUrls: downloadUrls || {} });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
