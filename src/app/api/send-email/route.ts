import { NextRequest, NextResponse } from "next/server";
import { sendSignupEmail, sendOrderConfirmation, sendOrderStatusUpdate } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === "signup") {
      const { name, email } = body;
      if (!name || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      await sendSignupEmail(name, email);
      return NextResponse.json({ ok: true });
    }

    if (type === "order") {
      const { orderId, name, email, items, total, utr } = body;
      if (!orderId || !name || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      await sendOrderConfirmation({ orderId, name, email, items: items || [], total: total || 0, utr });
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
