import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("edubazar_admin_session")?.value;

  if (!isValidAdminSession(session)) {
    redirect("/admin/login");
  }

  const db = getDb();
  let orders: Record<string, unknown>[] = [];
  if (db) {
    const { data } = await db.from("orders").select("*").order("date", { ascending: false });
    orders = (data as Record<string, unknown>[]) || [];
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Admin Dashboard | EduBazar</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #181d27; }
          .header { background: #181d27; color: #fff; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
          .header h1 { font-size: 20px; font-weight: 600; }
          .header nav a { color: #fff; text-decoration: none; margin-left: 16px; font-size: 14px; }
          .container { max-width: 1200px; margin: 24px auto; padding: 0 16px; }
          .order { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #ccc; }
          .order.pending { border-left-color: #ffc107; }
          .order.rejected { border-left-color: #dc3545; }
          .order.approved { border-left-color: #28a745; }
          .order-id { font-family: monospace; font-size: 14px; color: #666; }
          .order-name { font-size: 18px; font-weight: 600; margin: 4px 0; }
          .order-email { font-size: 13px; color: #666; margin-bottom: 8px; }
          .order-items { font-size: 14px; margin-bottom: 8px; }
          .order-meta { display: flex; gap: 24px; margin-bottom: 12px; }
          .order-meta div { font-size: 14px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
          .status.pending { background: #fff3cd; color: #856404; }
          .status.rejected { background: #f8d7da; color: #721c24; }
          .status.approved { background: #d4edda; color: #155724; }
          .actions { display: flex; gap: 12px; }
          .btn { display: inline-block; padding: 12px 28px; border-radius: 6px; font-size: 15px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
          .btn-approve { background: #28a745; color: #fff; }
          .btn-reject { background: #dc3545; color: #fff; }
          .empty { text-align: center; padding: 60px; color: #666; }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>EduBazar Admin</h1>
          <nav>
            <a href="/">View Store</a>
            <a href="/admin/seo">SEO</a>
            <a href="/api/admin/logout">Logout</a>
          </nav>
        </div>
        <div className="container">
          <h2 style={{ marginBottom: 20 }}>Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <div className="empty">No orders found.</div>
          ) : (
            orders.map((o) => {
              const status = String(o.status || "pending").toLowerCase();
              const items = typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []);
              return (
                <div key={String(o.order_id)} className={`order ${status}`}>
                  <div className="order-id">{String(o.order_id)}</div>
                  <div className="order-name">{String(o.name)}</div>
                  <div className="order-email">{String(o.email)}</div>
                  <div className="order-items">
                    {(items as Array<{ name: string }>).map((i) => i.name).join(", ")}
                  </div>
                  <div className="order-meta">
                    <div><strong>₹{String(o.total)}</strong></div>
                    <div>UTR: {String(o.utr || "—")}</div>
                  </div>
                  <span className={`status ${status}`}>
                    {status === "approved" ? "APPROVED" : status === "pending" ? "PENDING" : "REJECTED"}
                  </span>
                  {status !== "approved" && (
                    <div className="actions">
                      <a href={`/api/admin/orders/approve?orderId=${o.order_id}`} className="btn btn-approve">✓ YES - Approve</a>
                      {status === "pending" && (
                        <a href={`/api/admin/orders/reject?orderId=${o.order_id}`} className="btn btn-reject">✕ NO - Reject</a>
                      )}
                    </div>
                  )}
                  {status === "approved" && (
                    <div style={{ color: "#28a745", fontWeight: 600 }}>✓ Link Sent</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </body>
    </html>
  );
}
