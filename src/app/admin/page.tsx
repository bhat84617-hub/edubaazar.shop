"use client";

import { useEffect, useState, useCallback } from "react";

// Inline type definition - no external import
type OrderItem = { id: string; name: string; price: number; img: string; qty: number; downloadUrl?: string | null };
type Order = {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  utr?: string;
  date: string;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    let alive = true;
    setDebug("Checking session...");
    const check = (n = 0) => {
      fetch("/api/admin/session", { credentials: "same-origin" })
        .then((r) => {
          if (!alive) return;
          setDebug("Session response: " + r.status);
          if (r.ok) { setAuthed(true); setDebug("Authenticated!"); }
          else if (n < 8) setTimeout(() => check(n + 1), 600);
          else { setDebug("Session failed - redirecting to login"); window.location.href = "/admin/login"; }
        })
        .catch((e) => { if (!alive) return; setDebug("Session error: " + e.message); if (n < 8) setTimeout(() => check(n + 1), 600); else window.location.href = "/admin/login"; });
    };
    check();
    return () => { alive = false; };
  }, []);

  const load = useCallback(async () => {
    try {
      setDebug("Loading orders...");
      const r = await fetch("/api/admin/orders/status", { cache: "no-store", credentials: "same-origin" });
      setDebug("Orders response: " + r.status);
      if (r.status === 401) { window.location.href = "/admin/login"; return; }
      const d = await r.json() as { orders?: Order[] };
      setOrders(d.orders || []);
      setDebug("Loaded " + (d.orders || []).length + " orders");
    } catch (e) { setDebug("Load error: " + (e as Error).message); }
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

  if (!authed) return (
    <div style={{ padding: 40, textAlign: "center", fontSize: 18, fontFamily: "Arial, sans-serif" }}>
      Loading admin panel...<br />
      <small style={{ color: "#999" }}>{debug}</small>
    </div>
  );

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: "#333" }}>Admin Dashboard</h1>
        <p style={{ color: "#999", fontSize: 12, marginBottom: 16 }}>Debug: {debug}</p>

        {msg && (
          <div style={{ padding: 14, marginBottom: 20, background: msg.includes("FAILED") ? "#f8d7da" : "#d4edda", color: msg.includes("FAILED") ? "#721c24" : "#155724", borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
            {msg}
          </div>
        )}

        <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          <button onClick={load} style={{ padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>Refresh</button>
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/"; }} style={{ padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>Logout</button>
          <a href="/" style={{ padding: "10px 20px", background: "#181d27", color: "#fff", borderRadius: 6, fontSize: 14, textDecoration: "none" }}>View Store</a>
        </div>

        {loading ? (
          <p style={{ fontSize: 16 }}>Loading orders... ({debug})</p>
        ) : orders.length === 0 ? (
          <p style={{ fontSize: 16, color: "#666" }}>No orders found.</p>
        ) : (
          orders.map((o, idx) => {
            const s = (o.status || "").toLowerCase();
            const isBusy = busy === o.orderId;

            return (
              <div key={o.orderId} style={{ background: "#fff", padding: 20, marginBottom: 16, borderRadius: 8, border: "2px solid #ccc", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Order #{idx + 1}: {o.orderId}</div>
                <div style={{ marginBottom: 6 }}>Name: {o.name}</div>
                <div style={{ marginBottom: 6 }}>Email: {o.email}</div>
                <div style={{ marginBottom: 6 }}>Items: {(o.items || []).map(i => i.name).join(", ")}</div>
                <div style={{ marginBottom: 6 }}>Amount: ₹{o.total}</div>
                <div style={{ marginBottom: 6 }}>UTR: {o.utr || "—"}</div>
                <div style={{ marginBottom: 6, fontWeight: "bold" }}>Status: "{o.status}" → s = "{s}"</div>

                <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                  {(s === "pending" || s === "rejected") && (
                    <button
                      disabled={isBusy}
                      onClick={() => approve(o)}
                      style={{ padding: "14px 30px", background: isBusy ? "#999" : "#28a745", color: "#fff", border: "none", borderRadius: 6, fontSize: 18, fontWeight: "bold", cursor: isBusy ? "not-allowed" : "pointer" }}
                    >
                      {isBusy ? "⏳" : "✓ YES - Approve"}
                    </button>
                  )}
                  {s === "pending" && (
                    <button
                      disabled={isBusy}
                      onClick={() => reject(o)}
                      style={{ padding: "14px 30px", background: isBusy ? "#999" : "#dc3545", color: "#fff", border: "none", borderRadius: 6, fontSize: 18, fontWeight: "bold", cursor: isBusy ? "not-allowed" : "pointer" }}
                    >
                      {isBusy ? "⏳" : "✕ NO - Reject"}
                    </button>
                  )}
                  {s === "approved" && (
                    <span style={{ color: "#28a745", fontSize: 16, fontWeight: "bold" }}>✓ Link Sent</span>
                  )}
                  {!(s === "pending" || s === "rejected" || s === "approved") && (
                    <span style={{ color: "#999", fontSize: 14 }}>Unknown status - no buttons</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
