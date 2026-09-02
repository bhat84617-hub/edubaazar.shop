import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  BOT_TOKEN,
  sendMessage,
  sendPhoto,
  answerCallbackQuery,
  formatProduct,
  mainMenuKeyboard,
  categoriesKeyboard,
  productsKeyboard,
  productActionKeyboard,
  SITE_URL,
} from "@/lib/telegram";
import {
  CATEGORIES,
  getProductById,
  searchProducts,
  products,
} from "@/lib/products";
import { STORE } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory session map keyed by chatId. Persist via globalThis to survive hot reloads / serverless warm invocations.
type Session = {
  step: "idle" | "awaiting_email" | "awaiting_phone" | "awaiting_utr" | "awaiting_orders_email";
  productId?: string;
  email?: string;
  phone?: string;
  name?: string;
};

const g = globalThis as unknown as { __tgSessions?: Map<string, Session> };
if (!g.__tgSessions) g.__tgSessions = new Map();
const sessions = g.__tgSessions;

function getSession(chatId: string): Session {
  if (!sessions.has(chatId)) sessions.set(chatId, { step: "idle" });
  return sessions.get(chatId)!;
}
function clearSession(chatId: string) {
  sessions.set(chatId, { step: "idle" });
}
function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
function isPhone(s: string) {
  const digits = s.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
function isUTR(s: string) {
  const t = s.trim();
  // UTR: 10-18 chars alphanumeric, usually 12 digits. Accept 8-18
  return /^[A-Za-z0-9]{8,20}$/.test(t) && t.replace(/[^0-9]/g, "").length >= 6;
}
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function welcomeText(name?: string) {
  const n = name ? `, ${name}` : "";
  return `Namaste${n}! 🙏\n\n<b>Welcome to EduBazar.shop Bot</b> 🎓\n<i>India ka sabse sasta premium courses store</i>\n\nYahan aap koi bhi course ke baare me puch sakte ho, details le sakte ho, aur direct pay karke buy kar sakte ho — bilkul website jaisa flow (UPI + UTR verification) ✅\n\n👇 Neeche se choose karo:`;
}

function contactText() {
  return `💬 <b>Contact Support — EduBazar.shop</b>\n\n📱 WhatsApp: <b>+91 ${STORE.phoneRaw}</b> (24x7)\n📧 Email: <b>${STORE.email}</b>\n🌐 Website: <b>https://www.edubaazar.shop</b>\n\nKoi bhi doubt ho to WhatsApp pe message karo, team turant reply karegi!`;
}

function upiText(amount: number, productTitle: string) {
  const upiId = STORE.upiId;
  const note = `EduBazar ${productTitle}`.slice(0, 30);
  const link = `upi://pay?pa=${upiId}&pn=EduBazar&cu=INR${amount > 0 ? `&am=${amount}` : ""}&tn=${encodeURIComponent(note)}`;
  return `💳 <b>Payment — UPI (same as website)</b>\n\nCourse: <b>${escape(productTitle)}</b>\nAmount: <b>₹${amount}</b>\nUPI ID: <code>${upiId}</code>\n\n👉 <a href="${link}">Click to Pay via UPI App</a> (PhonePe / GPay / Paytm)\n\nYa QR se pay karo website pe: https://www.edubaazar.shop/checkout\n\nPay karne ke baad jo <b>UTR / Reference No. (12 digits)</b> mile, wahi yahan bhejo ✅\n\n⚠️ UTR bina order confirm nahi hoga.`;
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function handleStart(chatId: string, fromName?: string) {
  await sendMessage(chatId, welcomeText(fromName), {
    reply_markup: mainMenuKeyboard(),
  });
}

async function handleCategories(chatId: string) {
  const txt =
    `🗂 <b>Browse Categories</b>\n\nNeeche koi bhi category choose karo — top courses dikhenge 👇\n\n` +
    CATEGORIES.map((c) => `• <b>${c.label}</b> (${c.key})`).join("\n") +
    `\n\n💡 <i>Ya seedha course ka naam type karo — bot search karke dikhayega!</i>`;
  await sendMessage(chatId, txt, { reply_markup: categoriesKeyboard() });
}

async function handleCategoryProducts(chatId: string, categoryKey: string) {
  const list = products.filter((p) => p.category.toLowerCase() === categoryKey.toLowerCase()).slice(0, 8);
  if (list.length === 0) {
    await sendMessage(chatId, `😔 <b>${escape(categoryKey)}</b> me abhi koi course nahi mila.\nDusri category try karo ya search karo.`, {
      reply_markup: categoriesKeyboard(),
    });
    return;
  }
  const lines = list.map((p, idx) => `${idx + 1}. <b>${escape(p.title.slice(0, 60))}</b> — ₹${p.price} ⭐${p.rating}`).join("\n");
  const txt = `📚 <b>${escape(categoryKey)}</b> — Top ${list.length} Courses:\n\n${lines}\n\n👇 Koi bhi course pe tap karo details ke liye`;
  await sendMessage(chatId, txt, { reply_markup: productsKeyboard(categoryKey) });
}

async function handleProductView(chatId: string, productId: string) {
  const p = getProductById(productId);
  if (!p) {
    await sendMessage(chatId, `❌ Course nahi mila (ID: ${escape(productId)}). Categories se dobara try karo.`, {
      reply_markup: categoriesKeyboard(),
    });
    return;
  }
  const caption = formatProduct(p);
  const siteImageBase = SITE_URL || "https://www.edubaazar.shop";
  const imageUrl = p.images[0]?.startsWith("http") ? p.images[0] : siteImageBase.replace(/\/$/, "") + p.images[0];

  // Try sendPhoto, fallback to sendMessage if fails (local images may not be fetchable by Telegram)
  const keyboard = productActionKeyboard(p.id, p.category);
  let sent = false;
  if (imageUrl && imageUrl.startsWith("http")) {
    try {
      const res = await sendPhoto(chatId, imageUrl, caption + `\n\n👇 Buy Now dabao aur turant access pao!`, {
        reply_markup: keyboard,
      });
      // check ok
      const ok = (res as unknown as { ok?: boolean })?.ok;
      if (ok) sent = true;
    } catch {
      // ignore
    }
  }
  if (!sent) {
    await sendMessage(chatId, caption + `\n\n👇 <b>Buy Now</b> dabao aur turant order karo!`, {
      reply_markup: keyboard,
    });
  }
}

async function handleDetails(chatId: string, productId: string) {
  const p = getProductById(productId);
  if (!p) {
    await sendMessage(chatId, "❌ Course nahi mila.");
    return;
  }
  const full = p.fullDesc ? escape(p.fullDesc.slice(0, 3600)) : escape(p.desc);
  const txt =
    `📖 <b>${escape(p.title)}</b> — Details\n\n` +
    `${full}${p.fullDesc && p.fullDesc.length > 3600 ? "…" : ""}\n\n` +
    `📦 ${escape(p.category)} • Level: ${escape(p.level)} • ${escape(p.duration)}\n` +
    `👥 ${escape(p.students)} students • ⭐ ${p.rating} (${escape(p.reviewCount)} reviews)\n` +
    `💰 <b>₹${p.price}</b> (MRP ₹${p.oldPrice})\n\n` +
    `✨ Includes:\n` +
    (p.includes?.map((x) => `• ${escape(x)}`).join("\n") ?? "• Lifetime access") +
    `\n\n🌐 Full page: https://www.edubaazar.shop/product/${p.slug}`;
  await sendMessage(chatId, txt, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🛒 Buy Now", callback_data: `buy:${p.id}` },
          { text: "⬅ Back", callback_data: `product:${p.id}` },
        ],
        [{ text: "🏠 Main Menu", callback_data: "start" }],
      ],
    },
  });
}

async function startBuyFlow(chatId: string, productId: string, fromName?: string) {
  const p = getProductById(productId);
  if (!p) {
    await sendMessage(chatId, "❌ Course nahi mila.");
    return;
  }
  const sess = getSession(chatId);
  sess.step = "awaiting_email";
  sess.productId = productId;
  sess.name = fromName || sess.name;
  // Clear previous email/phone if new flow
  sess.email = undefined;
  sess.phone = undefined;
  await sendMessage(
    chatId,
    `🛒 <b>${escape(p.title)}</b>\nPrice: <b>₹${p.price}</b>\n\n` +
      `Chalo order start karte hain! 👇\n\n` +
      `1️⃣ Apna <b>Email</b> bhejo jahan download link chahiye 📧\n<i>(jaisi website pe daalte ho)</i>`,
  );
}

async function handleMyOrdersPrompt(chatId: string) {
  const sess = getSession(chatId);
  sess.step = "awaiting_orders_email";
  await sendMessage(
    chatId,
    `📦 <b>My Orders</b>\n\nApna <b>Email</b> bhejo jisse aapne order kiya tha — bot aapke saare orders aur download links dikha dega ✅\n\n<i>Example: yourname@gmail.com</i>`,
  );
}

async function fetchAndShowOrders(chatId: string, email: string) {
  const db = getSupabase();
  if (!db) {
    await sendMessage(
      chatId,
      `⚠️ Database abhi configure nahi hai. Admin se contact karo: ${STORE.phoneRaw}\nAapka email: <code>${escape(email)}</code>`,
    );
    return;
  }
  const { data, error } = await db.from("orders").select("*").eq("email", email.trim().toLowerCase()).order("date", { ascending: false }).limit(10);
  if (error) {
    console.error("[telegram] fetch orders error", error.message);
    await sendMessage(chatId, `❌ Orders fetch karne me error aaya. Thodi der baad try karo ya WhatsApp karo: ${STORE.phoneRaw}`);
    return;
  }
  if (!data || data.length === 0) {
    await sendMessage(
      chatId,
      `📭 <b>${escape(email)}</b> pe koi order nahi mila.\n\nPehle koi course kharido — <b>Browse Categories</b> dabao!`,
      { reply_markup: categoriesKeyboard() },
    );
    return;
  }
  for (const o of data.slice(0, 5)) {
    const items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
    const arr = Array.isArray(items) ? items : [];
    const statusEmoji = o.status === "approved" ? "✅ Approved" : o.status === "rejected" ? "❌ Rejected" : "⏳ Pending (verification me)";
    const lines = arr.map((it: { name: string; price: number; downloadUrl?: string }) => `• ${escape(it.name)} — ₹${it.price}`).join("\n");
    const dl =
      o.status === "approved"
        ? arr
            .filter((it: { downloadUrl?: string }) => it.downloadUrl && it.downloadUrl.startsWith("http"))
            .map((it: { name: string; downloadUrl: string }) => `🔗 <a href="${it.downloadUrl}">Download: ${escape(it.name)}</a>`)
            .join("\n") || "\n<i>Download link admin ne approve kiya hai — agar missing lage to support pe bolo</i>"
        : "";
    const txt =
      `📦 <b>Order ${escape(o.order_id)}</b>\n` +
      `${statusEmoji}\n` +
      `📅 ${new Date(o.date).toLocaleString("en-IN")}\n` +
      `💰 Total: <b>₹${o.total}</b> • UTR: <code>${escape(o.utr || "—")}</code>\n\n` +
      `Items:\n${lines}\n` +
      (dl ? `\n${dl}\n` : "") +
      (o.status === "pending" ? `\n<i>Admin UTR verify karke approve karega, phir yahi pe download link aa jayega + email bhi jayega.</i>` : "") +
      (o.status === "rejected" ? `\n<i>UTR galat/fake tha? Sahi UTR ke saath dobara order karo ya WhatsApp: ${STORE.phoneRaw}</i>` : "");
    await sendMessage(chatId, txt);
  }
  if (data.length > 5) {
    await sendMessage(chatId, `...aur ${data.length - 5} orders bhi hain. Website pe https://www.edubaazar.shop/account pe full history dekho.`);
  }
}

async function handleSearch(chatId: string, query: string) {
  const results = searchProducts(query);
  if (results.length === 0) {
    await sendMessage(
      chatId,
      `🔍 "<b>${escape(query)}</b>" pe kuch nahi mila 😔\n\nDusra keyword try karo — jaise <i>hacking, python, trading, photoshop, seo</i>`,
      { reply_markup: categoriesKeyboard() },
    );
    return;
  }
  const txt =
    `🔍 <b>"${escape(query)}" — ${results.length} results</b>\n\n` +
    results.map((p, i) => `${i + 1}. ${escape(p.title.slice(0, 58))} — ₹${p.price} (${escape(p.category)})`).join("\n") +
    `\n\n👇 Neeche tap karo details ke liye`;
  const keyboard = {
    inline_keyboard: [
      ...results.map((p) => [{ text: `${p.title.slice(0, 42)} — ₹${p.price}`, callback_data: `product:${p.id}` } as const]),
      [{ text: "🗂 Browse Categories", callback_data: "categories" }],
      [{ text: "🏠 Main Menu", callback_data: "start" }],
    ],
  };
  await sendMessage(chatId, txt, { reply_markup: keyboard });
}

async function createOrderSupabase(
  chatId: string,
  sess: Session,
  utr?: string
) {
  const product = sess.productId ? getProductById(sess.productId) : undefined;
  if (!product || !sess.email || !sess.phone) {
    await sendMessage(chatId, `❌ Order data missing. Dobara <b>Buy Now</b> se start karo.`, { reply_markup: categoriesKeyboard() });
    return;
  }
  const orderId = "EDU-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const items = [
    {
      id: product.id,
      name: product.title,
      price: product.price,
      img: product.images[0] || "",
      qty: 1,
      downloadUrl: product.downloadUrl || null,
    },
  ];
  const total = product.price;
  const status = total <= 0 ? "approved" : "pending";
  const date = new Date().toISOString();
  const name = sess.name || "Telegram User";
  const db = getSupabase();

  const payload = {
    order_id: orderId,
    name,
    email: sess.email.toLowerCase().trim(),
    phone: sess.phone.replace(/\D/g, ""),
    items: JSON.stringify(items),
    total,
    status,
    payment_method: "upi_qr",
    utr: utr || "",
    date,
  };

  if (db) {
    const { error } = await db.from("orders").insert([payload]);
    if (error) {
      console.error("[telegram] order insert error", error.message);
      // still show user success but warn
      await sendMessage(
        chatId,
        `⚠️ Order <b>${orderId}</b> local save hua par server sync fail hua: ${escape(error.message)}\nWhatsApp karo: ${STORE.phoneRaw} — manual verify kar denge.`,
      );
    }
  } else {
    console.warn("[telegram] supabase not configured, order not persisted", orderId);
  }

  // Try send email via Resend if configured (fire and forget)
  try {
    const { sendOrderConfirmation } = await import("@/lib/email");
    await sendOrderConfirmation({
      orderId,
      name,
      email: sess.email,
      items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      total,
      utr,
      downloadUrls: status === "approved" && product.downloadUrl ? { [product.title]: product.downloadUrl } : {},
    });
  } catch {
    // ignore email errors
  }

  clearSession(chatId);

  if (status === "approved") {
    const dl = product.downloadUrl ? `\n🔗 <a href="${product.downloadUrl}">Download: ${escape(product.title)}</a>` : "";
    await sendMessage(
      chatId,
      `🎉 <b>Order Confirmed & Approved!</b> ✅\n\nOrder ID: <code>${orderId}</code>\nCourse: <b>${escape(product.title)}</b>\nTotal: <b>FREE</b>\n\n${dl}\n\n📧 Email pe bhi link bhej diya hai (${escape(sess.email)}).\nEnjoy! 🚀`,
    );
  } else {
    await sendMessage(
      chatId,
      `✅ <b>Order Received!</b>\n\nOrder ID: <code>${orderId}</code>\nCourse: <b>${escape(product.title)}</b>\nTotal: <b>₹${total}</b>\nUTR: <code>${escape(utr || "")}</code>\nStatus: <b>⏳ Pending (Admin verification)</b>\n\nAdmin UTR verify karke approve karega (usually 5-30 min). Approve hote hi:\n• Bot pe yahi download link aa jayega\n• Email pe bhi link jayega (${escape(sess.email)})\n\n📦 Order status dekhne ke liye <b>My Orders</b> dabao ya WhatsApp: ${STORE.phoneRaw}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📦 My Orders", callback_data: "myorders" }],
            [{ text: "💬 Contact Support", callback_data: "contact" }],
          ],
        },
      },
    );
  }
}

export async function POST(request: NextRequest) {
  // Avoid logging token
  let update: {
    message?: { chat: { id: number }; from?: { id?: number; first_name?: string; username?: string }; text?: string };
    callback_query?: { id: string; from: { id?: number; first_name?: string }; message?: { chat: { id: number }; message_id: number }; data?: string };
  };
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    // Handle callback_query first (higher priority, must answer quickly)
    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = String(cq.message?.chat.id ?? cq.from?.id ?? "");
      const data = cq.data || "";
      // Always answer callback to remove loading state
      await answerCallbackQuery(cq.id).catch(() => {});

      if (!chatId || chatId === "undefined") {
        return NextResponse.json({ ok: true });
      }

      if (data === "start" || data === "main_menu") {
        await handleStart(chatId, cq.from.first_name);
      } else if (data === "categories") {
        await handleCategories(chatId);
      } else if (data.startsWith("cat:")) {
        const cat = data.slice(4);
        await handleCategoryProducts(chatId, cat);
      } else if (data.startsWith("product:")) {
        const pid = data.slice(8);
        await handleProductView(chatId, pid);
      } else if (data.startsWith("buy:")) {
        const pid = data.slice(4);
        await startBuyFlow(chatId, pid, cq.from.first_name);
      } else if (data.startsWith("details:")) {
        const pid = data.slice(8);
        await handleDetails(chatId, pid);
      } else if (data === "myorders") {
        await handleMyOrdersPrompt(chatId);
      } else if (data === "contact") {
        await sendMessage(chatId, contactText());
      } else if (data === "search_hint") {
        await sendMessage(
          chatId,
          `🔍 <b>Search kaise kare?</b>\n\nBas course ka naam type karo chat me — jaise:\n• <code>hacking</code>\n• <code>python</code>\n• <code>trading psychology</code>\n• <code>photoshop</code>\n\nBot turant matching courses dikha dega!`,
        );
      } else {
        await sendMessage(chatId, `❓ Unknown action. Main Menu dabao.`, { reply_markup: mainMenuKeyboard() });
      }
      return NextResponse.json({ ok: true });
    }

    if (update.message) {
      const msg = update.message;
      const chatId = String(msg.chat.id);
      const text = msg.text?.trim() || "";
      const fromName = msg.from?.first_name || undefined;
      if (!text) return NextResponse.json({ ok: true });

      const sess = getSession(chatId);

      // Commands
      if (text.startsWith("/start")) {
        clearSession(chatId);
        const payload = text.split(" ")[1]; // deep link payload maybe product id
        if (payload && getProductById(payload)) {
          await handleProductView(chatId, payload);
        } else {
          await handleStart(chatId, fromName);
        }
        return NextResponse.json({ ok: true });
      }
      if (text === "/help" || text === "/menu") {
        await sendMessage(chatId, welcomeText(fromName), { reply_markup: mainMenuKeyboard() });
        return NextResponse.json({ ok: true });
      }
      if (text === "/categories" || text.toLowerCase() === "categories") {
        await handleCategories(chatId);
        return NextResponse.json({ ok: true });
      }
      if (text === "/contact") {
        await sendMessage(chatId, contactText());
        return NextResponse.json({ ok: true });
      }
      if (text === "/myorders") {
        await handleMyOrdersPrompt(chatId);
        return NextResponse.json({ ok: true });
      }

      // Session-driven flows (must be before search)
      if (sess.step === "awaiting_email") {
        if (!isEmail(text)) {
          await sendMessage(chatId, `❌ Email galat lag raha hai 😅\nSahi email bhejo — jaise <code>you@gmail.com</code>`);
          return NextResponse.json({ ok: true });
        }
        sess.email = text.trim();
        sess.step = "awaiting_phone";
        await sendMessage(chatId, `✅ Email saved: <code>${escape(sess.email)}</code>\n\n2️⃣ Ab apna <b>Phone / WhatsApp number</b> bhejo 📱\n<i>(10 digits, jaise 9759131256)</i>`);
        return NextResponse.json({ ok: true });
      }
      if (sess.step === "awaiting_phone") {
        if (!isPhone(text)) {
          await sendMessage(chatId, `❌ Phone number galat hai. 10 digits ka number bhejo — jaise <code>9759131256</code>`);
          return NextResponse.json({ ok: true });
        }
        sess.phone = text.replace(/\D/g, "");
        const product = sess.productId ? getProductById(sess.productId) : undefined;
        if (!product) {
          clearSession(chatId);
          await sendMessage(chatId, `❌ Product missing. Dobara Buy Now dabao.`, { reply_markup: categoriesKeyboard() });
          return NextResponse.json({ ok: true });
        }
        if (product.price <= 0) {
          // Free product - directly create approved order
          await createOrderSupabase(chatId, sess, "");
          return NextResponse.json({ ok: true });
        }
        sess.step = "awaiting_utr";
        sess.name = sess.name || fromName || "Telegram User";
        await sendMessage(chatId, upiText(product.price, product.title));
        await sendMessage(chatId, `📝 UTR ka wait kar raha hu — pay karte hi yahan UTR bhejo (10-18 characters) 👇`);
        return NextResponse.json({ ok: true });
      }
      if (sess.step === "awaiting_utr") {
        if (!isUTR(text)) {
          await sendMessage(
            chatId,
            `❌ UTR galat lag raha hai. UTR 8-18 characters ka hota hai (mostly 12 digits).\nApne UPI app (PhonePe/GPay/Paytm) me <b>Transaction History</b> me jao aur wahi UTR copy karke bhejo.`,
          );
          return NextResponse.json({ ok: true });
        }
        await createOrderSupabase(chatId, sess, text.trim());
        return NextResponse.json({ ok: true });
      }
      if (sess.step === "awaiting_orders_email") {
        if (!isEmail(text)) {
          await sendMessage(chatId, `❌ Sahi email bhejo — jaise <code>you@gmail.com</code>`);
          return NextResponse.json({ ok: true });
        }
        const email = text.trim().toLowerCase();
        clearSession(chatId);
        await fetchAndShowOrders(chatId, email);
        return NextResponse.json({ ok: true });
      }

      // Default: treat as search query (any free text)
      // Ignore very short queries
      if (text.length < 2) {
        await sendMessage(chatId, `🤔 Kuch samajh nahi aaya. Course ka naam likho — jaise <code>hacking</code> ya <code>python</code>`, {
          reply_markup: mainMenuKeyboard(),
        });
        return NextResponse.json({ ok: true });
      }
      if (text.startsWith("/")) {
        await sendMessage(chatId, `❓ Command nahi samjha. <b>/start</b> dabao ya course search karo.`, { reply_markup: mainMenuKeyboard() });
        return NextResponse.json({ ok: true });
      }
      await handleSearch(chatId, text);
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error("[telegram] webhook error", e);
    // Don't expose errors to Telegram
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: "EduBazar webhook alive", token_present: BOT_TOKEN.length > 10 });
}
