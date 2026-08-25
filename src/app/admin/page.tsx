"use client";

import { useEffect, useState, useCallback } from "react";
import type { Order } from "@/lib/store";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

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

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const approve = async (o: Order) => {
    if (!confirm("YES = Approve & Send Download Link to Customer?")) return;
    setBusy(o.orderId);
    try {
      const urls: Record<string, string> = {};
      for (const item of o.items || []) urls[item.id] = item.downloadUrl || "";
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: o.orderId, status: "approved", downloadUrls: urls }),
      });
      if (!r.ok) { const err = await r.json(); throw new Error(err.error || "fail"); }
      setOrders(prev => prev.map(x => x.orderId === o.orderId ? { ...x, status: "approved" } : x));
      setMsg("APPROVED! Download link sent to customer.");
      setTimeout(() => setMsg(""), 5000);
    } catch (e: unknown) { setMsg("FAILED: " + (e instanceof Error ? e.message : "unknown")); setTimeout(() => setMsg(""), 5000); }
    setBusy(null);
  };

  const reject = async (o: Order) => {
    if (!confirm("NO = Reject? Customer will NOT get download link.")) return;
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
      setMsg("REJECTED! Customer will NOT receive download link.");
      setTimeout(() => setMsg(""), 5000);
    } catch { setMsg("FAILED!"); setTimeout(() => setMsg(""), 5000); }
    setBusy(null);
  };

  if (!authed) return <div style={{ padding: 60, textAlign: "center", fontSize: 24, fontFamily: "Arial, sans-serif" }}>Loading admin panel...</div>;

  const pending = orders.filter(o => (o.status || "").toLowerCase() === "pending");
  const approved = orders.filter(o => (o.status || "").toLowerCase() === "approved");
  const rejected = orders.filter(o => (o.status || "").toLowerCase() === "rejected");

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 16, color: "#333", textAlign: "center" }}>Admin Dashboard</h1>
        
        {msg && (
          <div style={{ 
            padding: 14, 
            marginBottom: 20, 
            background: msg.includes("FAILED") ? "#f8d7da" : "#d4edda", 
            color: msg.includes("FAILED") ? "#721c24" : "#155724", 
            borderRadius: 8, 
            fontWeight: 600, 
            fontSize: 16 
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ background: "#e9ecef", padding: "8px 16px", borderRadius: 6, fontSize: 14 }}>Total: {orders.length}</div>
            <div style={{ background: "#fff3cd", padding: "8px 16px", borderRadius: 6, fontSize: 14 }}>Pending: {pending.length}</div>
            <div style={{ background: "#d4edda", padding: "8px 16px", borderRadius: 6, fontSize: 14 }}>Approved: {approved.length}</div>
            <div style={{ background: "#f8d7da", padding: "8px 16px", borderRadius: 6, fontSize: 14 }}>Rejected: {rejected.length}</div>
          </div>
          <div>
            <button onClick={load} style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>Refresh</button>
            <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/"; }} style={{ padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>Logout</button>
            <a href="/" style={{ padding: "10px 20px", background: "#181d27", color: "#fff", borderRadius: 6, fontSize: 14, textDecoration: "none" }}>View Store</a>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6c757d" }}>
            <div style={{ width: 40, height: 40, border: "4px solid #e9ecef", borderTopColor: "#181d27", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6c757d" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p style={{ fontSize: 18 }}>No orders found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ background: "#181d27" }}>
                  <th style={th}>Order ID</th>
                  <th style={th}>Customer</th>
                  <th style={th}>Items</th>
                  <th style={th}>Amount</th>
                  <th style={th}>UTR</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => {
                  const s = (o.status || "").toLowerCase();
                  const isBusy = busy === o.orderId;
                  return (
                    <tr key={o.orderId} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "#f8f9fa" : "#fff" }}>
                      <td style={td}><code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: 3 }}>{o.orderId}</code></td>
                      <td style={td}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{o.name}</div>
                        <div style={{ fontSize: 12, color: "#6c757d" }}>{o.email}</div>
                      </td>
                      <td style={td}>{(o.items || []).map(i => i.name).join(", ")}</td>
                      <td style={td}><strong>₹{o.total}</strong></td>
                      <td style={td}><code>{o.utr || "—"}</code></td>
                      <td style={td}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontWeight: 600,
                          fontSize: 12,
                          background: s === "approved" ? "#d4edda" : s === "pending" ? "#fff3cd" : "#f8d7da",
                          color: s === "approved" ? "#155724" : s === "pending" ? "#856404" : "#721c24",
                        }}>
                          {s === "approved" ? "APPROVED" : s === "pending" ? "PENDING" : "REJECTED"}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: "center" }}>
                        {(s === "pending" || s === "rejected") && (
                          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                            <button
                              disabled={isBusy}
                              onClick={() => approve(o)}
                              style={{
                                padding: "10px 24px",
                                background: isBusy ? "#999" : "#28a745",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: isBusy ? "not-allowed" : "pointer",
                              }}
                            >
                              {isBusy ? "⏳" : "✓ YES - Approve"}
                            </button>
                            <button
                              disabled={isBusy}
                              onClick={() => reject(o)}
                              style={{
                                padding: "10px 24px",
                                background: isBusy ? "#999" : "#dc3545",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: isBusy ? "not-allowed" : "pointer",
                              }}
                            >
                              {isBusy ? "⏳" : "✕ NO - Reject"}
                            </button>
                          </div>
                        )}
                        {s === "approved" && (
                          <span style={{ color: "#28a745", fontWeight: 600, fontSize: 14 }}>✓ Link Sent</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#fff" };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 13, verticalAlign: "middle" };