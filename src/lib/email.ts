import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "EduBazar <onboarding@resend.dev>";
const ADMIN_EMAIL = "edubazarshop@gmail.com";

export function getResend() {
  if (!resendKey) return null;
  return new Resend(resendKey);
}

export async function sendSignupEmail(name: string, email: string) {
  const r = getResend();
  if (!r) return;
  try {
    await r.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to EduBazar.shop!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9f9;">
          <div style="background:#edece9;padding:24px;text-align:center;border-bottom:3px solid #687975;">
            <h1 style="margin:0;color:#181d27;font-size:22px;">EduBazar.shop</h1>
          </div>
          <div style="background:white;padding:32px;margin-top:16px;">
            <h2 style="color:#181d27;margin-top:0;">Welcome, ${name}! 🎉</h2>
            <p style="color:#444;line-height:1.7;">
              Your account has been created successfully. You can now browse our collection of courses, books, and tools.
            </p>
            <a href="https://edubaazar.shop/shop" style="display:inline-block;background:#687975;color:white;padding:12px 32px;text-decoration:none;font-weight:600;margin:16px 0;">
              Browse Courses →
            </a>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#888;font-size:12px;">If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      `,
    });
  } catch {
    // silent fail
  }
}

export async function sendOrderConfirmation(data: {
  orderId: string;
  name: string;
  email: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  utr?: string;
}) {
  const r = getResend();
  if (!r) return;

  const itemRows = data.items
    .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${i.price}</td></tr>`)
    .join("");

  const emailHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9f9;">
      <div style="background:#edece9;padding:24px;text-align:center;border-bottom:3px solid #687975;">
        <h1 style="margin:0;color:#181d27;font-size:22px;">EduBazar.shop</h1>
      </div>
      <div style="background:white;padding:32px;margin-top:16px;">
        <h2 style="color:#181d27;margin-top:0;">Order Confirmed ✓</h2>
        <p style="color:#444;">Hi ${data.name}, your order <strong>${data.orderId}</strong> has been received.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;">Qty</th><th style="padding:8px;text-align:right;">Price</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="font-size:18px;font-weight:700;color:#181d27;text-align:right;">Total: ₹${data.total}</p>
        ${data.utr ? `<p style="color:#666;">UTR: ${data.utr}</p>` : ""}
        ${data.total <= 0 ? '<p style="color:#2d7d46;font-weight:600;">✅ Free order — access granted immediately!</p>' : '<p style="color:#666;">⏳ Your order is being reviewed. You will get access once payment is verified.</p>'}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#888;font-size:12px;">Questions? WhatsApp us at 9759131256 or email edubazarshop@gmail.com</p>
      </div>
    </div>
  `;

  // Send to customer
  try {
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Order ${data.orderId} — EduBazar.shop`,
      html: emailHtml,
    });
  } catch {
    // silent
  }

  // Notify admin
  try {
    await r.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛒 New Order: ${data.orderId} — ₹${data.total}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;">
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.name} (${data.email})</p>
          <p><strong>Total:</strong> ₹${data.total}</p>
          ${data.utr ? `<p><strong>UTR:</strong> ${data.utr}</p>` : ""}
          <p><a href="https://edubaazar.shop/admin">Review in Admin Panel →</a></p>
        </div>
      `,
    });
  } catch {
    // silent
  }
}

export async function sendOrderStatusUpdate(data: {
  orderId: string;
  name: string;
  email: string;
  status: string;
}) {
  const r = getResend();
  if (!r) return;

  const statusText = data.status === "approved"
    ? "Your order has been approved! You can now download your course from your account."
    : "We couldn't process your order. Please contact support on WhatsApp at 9759131256.";

  try {
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Order ${data.orderId} — ${data.status.toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9f9;">
          <div style="background:#edece9;padding:24px;text-align:center;border-bottom:3px solid #687975;">
            <h1 style="margin:0;color:#181d27;font-size:22px;">EduBazar.shop</h1>
          </div>
          <div style="background:white;padding:32px;margin-top:16px;">
            <h2 style="color:#181d27;">Order ${data.status === "approved" ? "Approved ✅" : "Rejected ❌"}</h2>
            <p style="color:#444;">Hi ${data.name},</p>
            <p style="color:#444;line-height:1.7;">${statusText}</p>
            <p style="color:#666;">Order ID: <strong>${data.orderId}</strong></p>
            <a href="https://edubaazar.shop/account" style="display:inline-block;background:#687975;color:white;padding:12px 32px;text-decoration:none;font-weight:600;margin:16px 0;">
              Go to My Account →
            </a>
          </div>
        </div>
      `,
    });
  } catch {
    // silent
  }
}
