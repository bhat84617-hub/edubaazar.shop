// EduBazar Telegram Bot helpers - fetch based (no extra deps)
import { CATEGORIES as CAT_LIST, products, getProductById } from "./products";

export const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "8288491826:AAEdR_ZpzM0P7gmH2KFRJ1Cu6KCyF2Ht7PM";

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

type InlineKeyboardButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

type ReplyMarkup = {
  inline_keyboard: InlineKeyboardButton[][];
};

type SendMessageOptions = {
  parse_mode?: "HTML" | "MarkdownV2" | "Markdown";
  reply_markup?: ReplyMarkup;
  disable_web_page_preview?: boolean;
};

async function tgFetch(method: string, body: Record<string, unknown>) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    if (!data.ok) {
      console.error(`[telegram] ${method} failed:`, data.description || res.status);
    }
    return data;
  } catch (e) {
    console.error(`[telegram] ${method} exception`, e);
    return { ok: false } as const;
  }
}

export function getBot() {
  // raw fetch wrapper - keeps dependency minimal
  return {
    token: BOT_TOKEN,
    apiBase: API_BASE,
    sendMessage,
    sendPhoto,
    answerCallbackQuery,
    editMessageText,
  };
}

export async function sendMessage(chatId: number | string, text: string, options: SendMessageOptions = {}) {
  return tgFetch("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options.parse_mode || "HTML",
    disable_web_page_preview: options.disable_web_page_preview ?? true,
    ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
  });
}

export async function sendPhoto(
  chatId: number | string,
  photo: string,
  caption?: string,
  options: SendMessageOptions = {}
) {
  return tgFetch("sendPhoto", {
    chat_id: chatId,
    photo,
    ...(caption ? { caption, parse_mode: options.parse_mode || "HTML" } : {}),
    ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return tgFetch("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...(text ? { text, show_alert: false } : {}),
  });
}

export async function editMessageText(
  chatId: number | string,
  messageId: number,
  text: string,
  options: SendMessageOptions = {}
) {
  return tgFetch("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: options.parse_mode || "HTML",
    disable_web_page_preview: options.disable_web_page_preview ?? true,
    ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
  });
}

export function formatINR(n: number): string {
  if (n <= 0) return "FREE";
  return "₹" + n.toLocaleString("en-IN");
}

export function formatProduct(
  p: (typeof products)[number],
  opts: { short?: boolean } = {}
): string {
  const price = formatINR(p.price);
  const old = p.oldPrice > p.price ? ` <s>${formatINR(p.oldPrice)}</s>` : "";
  const badge = p.badge ? ` <b>[${p.badge}]</b>` : "";
  const rating = `⭐ ${p.rating} (${p.reviewCount})`;
  const cat = `📦 ${p.category} • ${p.kind} • ${p.level}`;
  const students = `👥 ${p.students} students • ${p.duration}`;
  if (opts.short) {
    return `<b>${escapeHtml(p.title)}</b>\n${cat}\n${price}${old} • ${rating}`;
  }
  const desc = escapeHtml(p.desc.slice(0, 280));
  const includes = p.includes?.slice(0, 3).join(" • ") ?? "";
  return `<b>${escapeHtml(p.title)}</b>${badge}\n${cat}\n${students}\n${rating}\n\n${desc}${p.desc.length > 280 ? "…" : ""}\n\n💰 <b>${price}</b>${old}${includes ? `\n✨ ${escapeHtml(includes)}` : ""}`;
}

export function formatCategory(cat: (typeof CAT_LIST)[number]): string {
  return `${cat.label} (${cat.key})`;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function mainMenuKeyboard(): ReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: "🗂 Browse Categories", callback_data: "categories" },
        { text: "🔍 Search Hint", callback_data: "search_hint" },
      ],
      [
        { text: "📦 My Orders", callback_data: "myorders" },
        { text: "💬 Contact Support", callback_data: "contact" },
      ],
      [
        { text: "🌐 View Shop (Website)", url: "https://www.edubaazar.shop/shop" },
      ],
    ],
  };
}

export function categoriesKeyboard(): ReplyMarkup {
  const rows: InlineKeyboardButton[][] = [];
  for (let i = 0; i < CAT_LIST.length; i += 2) {
    const row: InlineKeyboardButton[] = [];
    for (let j = i; j < Math.min(i + 2, CAT_LIST.length); j++) {
      const c = CAT_LIST[j];
      row.push({ text: c.label, callback_data: `cat:${c.key}` });
    }
    rows.push(row);
  }
  rows.push([
    { text: "🏠 Main Menu", callback_data: "start" },
    { text: "🔍 Search Courses", callback_data: "search_hint" },
  ]);
  return { inline_keyboard: rows };
}

export function productsKeyboard(categoryKey: string, limit = 8): ReplyMarkup {
  const list = products.filter((p) => p.category.toLowerCase() === categoryKey.toLowerCase()).slice(0, limit);
  const rows: InlineKeyboardButton[][] = list.map((p) => [
    { text: `${p.title.slice(0, 42)} — ${formatINR(p.price)}`, callback_data: `product:${p.id}` },
  ]);
  rows.push([{ text: "⬅ Back to Categories", callback_data: "categories" }]);
  rows.push([{ text: "🏠 Main Menu", callback_data: "start" }]);
  return { inline_keyboard: rows };
}

export function productActionKeyboard(productId: string, categoryKey: string): ReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: "🛒 Buy Now", callback_data: `buy:${productId}` },
        { text: "📖 More Details", callback_data: `details:${productId}` },
      ],
      [
        { text: "⬅ Back", callback_data: `cat:${categoryKey}` },
        { text: "🏠 Main Menu", callback_data: "start" },
      ],
      [
        { text: "🌐 View on Website", url: `https://www.edubaazar.shop/product/${getProductById(productId)?.slug ?? productId}` },
      ],
    ],
  };
}

export const SITE_URL = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const v = process.env.VERCEL_URL;
  if (v) return v.startsWith("http") ? v.replace(/\/$/, "") : `https://${v.replace(/\/$/, "")}`;
  return "https://www.edubaazar.shop";
})();
