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
    if (!confirm("Approve " + o.name + "?")) return;
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
      setMsg(o.name + " approved!");
      setTimeout(() => setMsg(""), 4000);
    } catch (e: unknown) { setMsg("Failed: " + (e instanceof Error ? e.message : "unknown")); setTimeout(() => setMsg(""), 4000); }
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
      setMsg(o.name + " rejected");
      setTimeout(() => setMsg(""), 4000);
    } catch { setMsg("Failed!"); setTimeout(() => setMsg(""), 4000); }
    setBusy(null);
  };

  if (!authed) return <div style={{ padding: 60, textAlign: "center" }}>Loading...</div>;

  const s = (status: string) => (status || "").toLowerCase();

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Admin Dashboard</h1>

      {msg && <div style={{ padding: 12, marginBottom: 16, background: msg.includes("Failed") ? "#f8d7da" : "#d4edda", color: msg.includes("Failed") ? "#721c24" : "#155724", borderRadius: 6, fontWeight: 600 }}>{msg}</div>}

      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <a href="/">Home</a>
        <button onClick={load} style={{ cursor: "pointer" }}>Refresh</button>
        <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/"; }} style={{ cursor: "pointer" }}>Logout</button>
      </div>

      {loading ? <p>Loading orders...</p> : orders.length === 0 ? <p>No orders yet.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ background: "#181d27", color: "#fff" }}>
              <th style={th}>Order ID</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Items</th>
              <th style={th}>Total</th>
              <th style={th}>UTR</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.orderId} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{o.orderId}</td>
                <td style={td}>{o.name}</td>
                <td style={td}>{o.email}</td>
                <td style={td}>{(o.items || []).map(i => i.name).join(", ")}</td>
                <td style={td}>₹{o.total}</td>
                <td style={td}>{o.utr || "—"}</td>
                <td style={td}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    background: s(o.status) === "approved" ? "#28a745" : s(o.status) === "pending" ? "#ffc107" : "#dc3545",
                    color: s(o.status) === "pending" ? "#000" : "#fff",
                  }}>
                    {s(o.status) === "approved" ? "APPROVED" : s(o.status) === "pending" ? "PENDING" : "REJECTED"}
                  </span>
                </td>
                <td style={td}>
                  {(s(o.status) === "pending" || s(o.status) === "rejected") && (
                    <button
                      onClick={() => approve(o)}
                      disabled={busy === o.orderId}
                      style={{
                        padding: "8px 20px",
                        background: busy === o.orderId ? "#999" : "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: busy === o.orderId ? "not-allowed" : "pointer",
                      }}
                    >
                      {busy === o.orderId ? "..." : "APPROVE"}
                    </button>
                  )}
                  {s(o.status) === "pending" && (
                    <button
                      onClick={() => reject(o)}
                      disabled={busy === o.orderId}
                      style={{
                        marginLeft: 6,
                        padding: "8px 20px",
                        background: busy === o.orderId ? "#999" : "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: busy === o.orderId ? "not-allowed" : "pointer",
                      }}
                    >
                      REJECT
                    </button>
                  )}
                  {s(o.status) === "approved" && <span style={{ color: "#28a745", fontWeight: 700 }}>✓ DONE</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 10px", textAlign: "left", fontSize: 13, fontWeight: 700 };
const td: React.CSSProperties = { padding: 10, fontSize: 13 };
