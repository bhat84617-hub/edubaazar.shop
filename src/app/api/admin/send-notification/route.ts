import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, name, email, status, items } = await request.json();

    const db = getDb();
    const resend = getResend();

    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Update order status in database
    if (status === "approved") {
      const updatedItems = items.map((item: any) => ({
        ...item,
        downloadUrl: item.downloadUrl || `https://www.edubaazar.shop/account`
      }));

      await db
        .from("orders")
        .update({ status: "approved", items: JSON.stringify(updatedItems) })
        .eq("order_id", orderId);
    } else {
      await db
        .from("orders")
        .update({ status: "rejected" })
        .eq("order_id", orderId);
    }

    // Send email notification
    if (resend) {
      const downloadLinks = status === "approved" 
        ? items
            .filter((item: any) => item.downloadUrl)
            .map((item: any) => `
              <p style="margin: 10px 0;">
                <a href="${item.downloadUrl}" 
                   style="display:inline-block;background:#687975;color:white;padding:11px 20px;
                          text-decoration:none;font-weight:600;border-radius:6px;">
                  Download ${item.name} →
                </a>
              </p>
            `).join("")
        : "";

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9f9;">
          <div style="background:#edece9;padding:24px;text-align:center;border-bottom:3px solid #687975;">
            <h1 style="margin:0;color:#181d27;font-size:22px;">EduBazar.shop</h1>
          </div>
          
          <div style="background:white;padding:32px;margin-top:16px;">
            <h2 style="color:#181d27;margin-top:0;">
              ${status === "approved" ? "✅ Order Approved - Download Links" : "❌ Order Rejected"}
            </h2>
            
            <p style="color:#444;line-height:1.7;font-size:15px;">
              Hi ${name},
            </p>
            
            ${status === "approved" ? `
              <p style="color:#444;line-height:1.7;font-size:15px;">
                Great news! Your order <strong>${orderId}</strong> has been approved and payment verified.
              </p>
              <p style="color:#444;line-height:1.7;font-size:15px;">
                You can now download your courses from your account dashboard or use the buttons below:
              </p>
              
              ${downloadLinks}
              
              <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-radius:8px;">
                <p style="color:#666;font-size:13px;margin:0;">
                  <strong>Alternative:</strong> You can also access all your downloads from your 
                  <a href="https://www.edubaazar.shop/account" style="color:#687975;">account dashboard</a>
                  at any time.
                </p>
              </div>
            ` : `
              <p style="color:#444;line-height:1.7;font-size:15px;">
                Unfortunately, we couldn't verify your payment for order <strong>${orderId}</strong>.
              </p>
              <p style="color:#666;font-size:14px;">
                This could be because:
              </p>
              <ul style="color:#666;font-size:14px;line-height:1.8;">
                <li>UTR number doesn't match the payment</li>
                <li>Payment amount is incorrect</li>
                <li>Payment not received yet</li>
              </ul>
              <p style="color:#444;line-height:1.7;font-size:15px;">
                Please contact us on WhatsApp with your correct UTR number to complete your order.
              </p>
            `}
            
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            
            <p style="color:#888;font-size:12px;margin:0;">
              Questions? Contact us on WhatsApp: 9759131256 or email: edubazarshop@gmail.com
            </p>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: "EduBazar <noreply@edubaazar.shop>",
        to: email,
        subject: `Order ${orderId} — ${status === "approved" ? "Approved - Download Now" : "Payment Not Verified"}`,
        html: emailHtml,
      });

      // Also notify admin
      await resend.emails.send({
        from: "EduBazar <noreply@edubaazar.shop>",
        to: "edubazarshop@gmail.com",
        subject: `Order ${orderId} ${status.toUpperCase()} by Admin`,
        html: `
          <div style="font-family:Arial;padding:20px;">
            <h2>Order ${status === "approved" ? "Approved" : "Rejected"}</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${name} (${email})</p>
            <p><strong>Status:</strong> ${status.toUpperCase()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: status === "approved" ? "Order approved and email sent" : "Order rejected and email sent" 
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}