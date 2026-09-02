import { NextRequest, NextResponse } from "next/server";
import { sendToChannel, CHANNEL_ID } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { text: string, parse_mode?: "HTML"|"Markdown" }
// Requires TELEGRAM_CHANNEL_ID env (e.g., @edubazarshop or -100xxxxxxxxxx) and bot must be admin in channel.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { text?: string; parse_mode?: "HTML" | "Markdown" };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ ok: false, error: "Missing 'text' field" }, { status: 400 });
    }
    if (!CHANNEL_ID) {
      return NextResponse.json({ ok: false, error: "CHANNEL_ID not configured. Set TELEGRAM_CHANNEL_ID env (e.g., @edubazarshop) and add bot as admin to channel." }, { status: 400 });
    }
    const res = await sendToChannel(text, { parse_mode: body.parse_mode || "HTML" });
    const ok = (res as { ok?: boolean })?.ok;
    if (!ok && !(res as { skipped?: boolean })?.skipped) {
      return NextResponse.json({ ok: false, channel: CHANNEL_ID, telegramResponse: res }, { status: 502 });
    }
    return NextResponse.json({ ok: true, channel: CHANNEL_ID, telegramResponse: res });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    channelConfigured: Boolean(CHANNEL_ID),
    channel: CHANNEL_ID || null,
    hint: CHANNEL_ID
      ? "POST { text } to send a message to the channel. Bot must be admin."
      : "Set TELEGRAM_CHANNEL_ID env (e.g., @edubazarshop or -100...) and add @Edubaazar_bot as admin to the channel. Then POST { text } here.",
    setup: [
      "1. Create a channel on Telegram (e.g., @edubazarshop) or get its -100... ID via @getidsbot",
      "2. Add @Edubaazar_bot as Admin to the channel (Post messages permission)",
      "3. Set TELEGRAM_CHANNEL_ID=@edubazarshop (or -100...) in Vercel env vars",
      "4. Redeploy and POST to /api/telegram/channel with { text: 'Hello channel!' }",
    ],
  });
}
