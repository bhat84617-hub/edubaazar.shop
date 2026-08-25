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
    const ok = confirm("YES - Approve? Download link send karega customer ko.");
    if (!ok) return;
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
      setMsg("APPROVED! Link sent to " + o.name);
      setTimeout(() => setMsg(""), 5000);
    } catch (e: unknown) { setMsg("FAILED: " + (e instanceof Error ? e.message : "unknown")); setTimeout(() => setMsg(""), 5000); }
    setBusy(null);
  };

  const reject = async (o: Order) => {
    const ok = confirm("NO - Reject? Customer ko link NAHI jayega.");
    if (!ok) return;
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
      setMsg("REJECTED! Customer ko link nahi gaya.");
      setTimeout(() => setMsg(""), 5000);
    } catch { setMsg("FAILED!"); setTimeout(() => setMsg(""), 5000); }
    setBusy(null);
  };

  if (!authed) return <div style={{ padding: 40, textAlign: "center", fontSize: 20, fontFamily: "Arial, sans-serif" }}>Loading admin panel...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 1000, margin: "0 auto", background: "#f5f5f5" }}>
      <h1 style={{ fontSize: 32, marginBottom: 16, color: "#000" }}>Admin Dashboard</h1>

      {msg && <div style={{ padding: 12, marginBottom: 16, background: "#d4edda", color: "#155724", fontSize: 16, fontWeight: "bold", borderRadius: 4 }}>{msg}</div>}

      {loading ? <p style={{ fontSize: 16 }}>Loading orders...</p> : orders.length === 0 ? <p style={{ fontSize: 16 }}>No orders found.</p> : (
        orders.map(o => {
          const st = (o.status || "").toLowerCase();
          const isBusy = busy === o.orderId;
          return (
            <div key={o.orderId} style={{
              background: "#fff",
              padding: 20,
              marginBottom: 16,
              borderRadius: 8,
              border: "2px solid #ccc",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}>
              <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#000" }}>Order: {o.orderId}</div>
              <div style={{ marginBottom: 8 }}>Name: {o.name}</div>
              <div style={{ marginBottom: 8 }}>Email: {o.email}</div>
              <div style={{ marginBottom: 8 }}>Items: {(o.items || []).map(i => i.name).join(", ")}</div>
              <div style={{ marginBottom: 8 }}>Amount: ₹{o.total}</div>
              <div style={{ marginBottom: 12 }}>UTR: {o.utr || "—"}</div>

              <div style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 4,
                fontSize: 14,
                fontWeight: "bold",
                marginBottom: 16,
                background: st === "approved" ? "#d4edda" : st === "pending" ? "#fff3cd" : "#f8d7da",
                color: st === "approved" ? "#155724" : st === "pending" ? "#856404" : "#721c24",
              }}>
                Status: {st === "approved" ? "APPROVED" : st === "pending" ? "PENDING" : "REJECTED"}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {(st === "pending" || st === "rejected") && (
                  <button
                    disabled={isBusy}
                    onClick={() => approve(o)}
                    style={{
                      padding: "14px 30px",
                      background: isBusy ? "#999" : "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 18,
                      fontWeight: "bold",
                      cursor: isBusy ? "not-allowed" : "pointer",
                    }}
                  >
                    ✓ YES - Approve & Send Link
                  </button>
                )}
                {st === "pending" && (
                  <button
                    disabled={isBusy}
                    onClick={() => reject(o)}
                    style={{
                      padding: "14px 30px",
                      background: isBusy ? "#999" : "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 18,
                      fontWeight: "bold",
                      cursor: isBusy ? "not-allowed" : "pointer",
                    }}
                  >
                    ✕ NO - Reject (No Link)
                  </button>
                )}
                {st === "approved" && (
                  <span style={{ color: "#28a745", fontSize: 16, fontWeight: "bold" }}>✓ Link Sent to Customer</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
