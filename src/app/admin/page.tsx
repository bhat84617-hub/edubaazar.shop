"use client";

import { useEffect, useState, useCallback } from "react";
import type { Order } from "@/lib/store";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 4000); };

  useEffect(() => {
    let alive = true;
    const check = (n = 0) => {
      fetch("/api/admin/session", { credentials: "same-origin" })
        .then((r) => { if (!alive) return; if (r.ok) setAuthed(true); else if (n < 8) setTimeout(() => check(n + 1), 600); else window.location.href = "/admin/login"; })
        .catch(() => { if (!alive) return; if (n < 8) setTimeout(() => check(n + 1), 600); else window.location.href = "/admin/login"; });
    };
    check();
    return () => { alive = false; };
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/orders/status", { cache: "no-store", credentials: "same-origin" });
      if (r.status === 401) { window.location.href = "/admin/login"; return; }
      const d = await r.json() as { orders?: Order[] };
      setOrders(d.orders || []);
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) { load(); const t = setInterval(load, 15000); return () => clearInterval(t); } }, [authed, load]);

  const approve = async (o: Order) => {
    const urls: Record<string, string> = {};
    let ok = true;
    for (const item of o.items || []) {
      urls[item.id] = item.downloadUrl || "";
      if (!urls[item.id] || !/^https?:\/\//i.test(urls[item.id])) ok = false;
    }
    if (!ok) { flash("Download URL missing for " + o.name); return; }
    if (!confirm("Approve " + o.name + "?")) return;
    setBusy(o.orderId);
    try {
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: o.orderId, status: "approved", downloadUrls: urls }),
      });
      if (!r.ok) throw new Error("fail");
      setOrders(prev => prev.map(x => x.orderId === o.orderId ? { ...x, status: "approved" } : x));
      flash(o.name + " approved!");
    } catch { flash("Failed!"); }
    setBusy(null);
  };

  const reject = async (o: Order) => {
    if (!confirm("Reject " + o.name + "?")) return;
    setBusy(o.orderId);
    try {
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: o.orderId, status: "rejected" }),
      });
      if (!r.ok) throw new Error("fail");
      setOrders(prev => prev.map(x => x.orderId === o.orderId ? { ...x, status: "rejected" } : x));
      flash(o.name + " rejected");
    } catch { flash("Failed!"); }
    setBusy(null);
  };

  if (!authed) return <div style={{ padding: 60, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Admin Dashboard</h1>
      {msg && <div style={{ padding: 12, marginBottom: 16, background: "#d4edda", border: "1px solid #aaa", fontWeight: 700 }}>{msg}</div>}
      <a href="/" style={{ marginRight: 12 }}>View Store</a>
      <a href="/admin/seo">SEO</a>
      <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); localStorage.removeItem("edubazar_admin"); window.location.href = "/"; }} style={{ marginLeft: 12 }}>Logout</button>
      <br /><br />
      {loading ? <p>Loading...</p> : orders.length === 0 ? <p>No orders</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={th}>Order ID</th>
              <th style={th}>Customer</th>
              <th style={th}>Items</th>
              <th style={th}>Total</th>
              <th style={th}>UTR</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const s = (o.status || "").toLowerCase();
              const isBusy = busy === o.orderId;
              return (
                <tr key={o.orderId} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={td}>{o.orderId}</td>
                  <td style={td}>{o.name}<br/><small>{o.email}</small></td>
                  <td style={td}>{(o.items || []).map(i => i.name).join(", ")}</td>
                  <td style={td}>₹{o.total}</td>
                  <td style={td}>{o.utr || "—"}</td>
                  <td style={td}>
                    <span style={{ padding: "3px 10px", fontWeight: 700, fontSize: 12, background: s === "approved" ? "#d4edda" : s === "pending" ? "#fff3cd" : "#f8d7da", color: s === "approved" ? "#155724" : s === "pending" ? "#856404" : "#721c24" }}>
                      {s === "approved" ? "Approved" : s === "pending" ? "Pending" : "Rejected"}
                    </span>
                  </td>
                  <td style={td}>
                    {(s === "pending" || s === "rejected") && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button disabled={isBusy} onClick={() => approve(o)} style={{ padding: "8px 16px", background: "#28a745", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          {isBusy ? "..." : "✓ Approve"}
                        </button>
                        <button disabled={isBusy} onClick={() => reject(o)} style={{ padding: "8px 16px", background: "#dc3545", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          ✕ Reject
                        </button>
                      </div>
                    )}
                    {s === "approved" && <span style={{ color: "#155724", fontWeight: 700 }}>✓ Done</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, borderBottom: "2px solid #ddd" };
const td: React.CSSProperties = { padding: 10, fontSize: 13, verticalAlign: "middle" };
