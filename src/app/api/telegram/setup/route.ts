import { NextRequest, NextResponse } from "next/server";
import { BOT_TOKEN } from "@/lib/telegram";
import { isValidAdminSession } from "@/lib/admin-session";
import { isSameOriginRequest } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Webhook re-pointing is a state-changing action → POST only.
// (GET would be CSRF-able from a logged-in admin's browser.)
export async function GET() {
  return NextResponse.json(
    {
      error: "Use POST to set the webhook (GET disabled for CSRF safety).",
      curl: 'curl -X POST https://www.edubaazar.shop/api/telegram/setup -b "edubazar_admin_session=<session>"',
    },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized - admin login required" }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "BOT_TOKEN not configured" }, { status: 500 });
  }
  const webhookUrl = `https://www.edubaazar.shop/api/telegram/webhook`;
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  // Use POST JSON to avoid token in URL logs
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        ...(secretToken ? { secret_token: secretToken } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({
      ok: data.ok ?? false,
      webhookUrl,
      telegramResponse: data,
      hint: data.ok ? "Webhook set! Now send /start to bot on Telegram." : "Failed to set webhook, check token and URL",
    });
    } catch (e) {
      return NextResponse.json({ ok: false, webhookUrl, error: String(e) }, { status: 500 });
    }
}
