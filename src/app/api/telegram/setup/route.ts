import { NextRequest, NextResponse } from "next/server";
import { BOT_TOKEN } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSiteUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "";
  if (envUrl) {
    if (envUrl.startsWith("http")) return envUrl.replace(/\/$/, "");
    return `https://${envUrl.replace(/\/$/, "")}`;
  }
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "https://www.edubaazar.shop";
}

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl(request);
  const webhookUrl = `${siteUrl}/api/telegram/webhook`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  try {
    const res = await fetch(url);
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

export async function POST(request: NextRequest) {
  return GET(request);
}
