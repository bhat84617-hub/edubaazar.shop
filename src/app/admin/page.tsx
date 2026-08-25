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
    const ok = confirm("YES = Approve & Send Download Link to " + o.name + "?");
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
    const ok = confirm("NO = Reject? " + o.name + " ko link NAHI jayega.");
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
      setMsg("REJECTED! " + o.name + " ko link nahi gaya.");
      setTimeout(() => setMsg(""), 5000);
    } catch { setMsg("FAILED!"); setTimeout(() => setMsg(""), 5000); }
    setBusy(null);
  };

  if (!authed) return <div style={{ padding: 60, textAlign: "center", fontSize: 18 }}>Loading admin panel...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: "#181d27" }}>Admin Dashboard</h1>
        <p style={{ color: "#666", marginBottom: 20 }}>Manage customer orders - Approve or Reject</p>

        {msg && (
          <div style={{
            padding: 14,
            marginBottom: 20,
            background: msg.includes("FAILED") ? "#f8d7da" : "#d4edda",
            color: msg.includes("FAILED") ? "#721c24" : "#155724",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
          }}>
            {msg}
          </div>
        )}

        <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          <button onClick={load} style={{ padding: "10px 20px", background: "#181d27", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Refresh Orders
          </button>
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/"; }} style={{ padding: "10px 20px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Logout
          </button>
          <a href="/" style={{ padding: "10px 20px", background: "#6c757d", color: "#fff", borderRadius: 6, fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
            View Store
          </a>
        </div>

        {loading ? (
          <p style={{ fontSize: 16 }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ fontSize: 16, color: "#666" }}>No orders yet.</p>
        ) : (
          orders.map(o => {
            const st = (o.status || "").toLowerCase();
            const isBusy = busy === o.orderId;
            return (
              <div key={o.orderId} style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                borderLeft: `5px solid ${st === "approved" ? "#28a745" : st === "pending" ? "#ffc107" : "#dc3545"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>ORDER ID</div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "monospace", marginBottom: 12 }}>{o.orderId}</div>

                    <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>CUSTOMER</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{o.name}</div>
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>{o.email}</div>

                    <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>ITEMS</div>
                    <div style={{ fontSize: 14, marginBottom: 12 }}>{(o.items || []).map(i => i.name).join(", ")}</div>

                    <div style={{ display: "flex", gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>AMOUNT</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>₹{o.total}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>UTR</div>
                        <div style={{ fontSize: 14, fontFamily: "monospace" }}>{o.utr || "—"}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center", minWidth: 200 }}>
                    <div style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>STATUS</div>
                    <div style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 16,
                      background: st === "approved" ? "#d4edda" : st === "pending" ? "#fff3cd" : "#f8d7da",
                      color: st === "approved" ? "#155724" : st === "pending" ? "#856404" : "#721c24",
                    }}>
                      {st === "approved" ? "✓ APPROVED" : st === "pending" ? "⏳ PENDING" : "✕ REJECTED"}
                    </div>

                    <div style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>ACTION</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      {(st === "pending" || st === "rejected") && (
                        <button
                          disabled={isBusy}
                          onClick={() => approve(o)}
                          style={{
                            padding: "12px 28px",
                            background: isBusy ? "#999" : "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: isBusy ? "not-allowed" : "pointer",
                          }}
                        >
                          {isBusy ? "..." : "✓ YES - Approve"}
                        </button>
                      )}
                      {st === "pending" && (
                        <button
                          disabled={isBusy}
                          onClick={() => reject(o)}
                          style={{
                            padding: "12px 28px",
                            background: isBusy ? "#999" : "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: isBusy ? "not-allowed" : "pointer",
                          }}
                        >
                          {isBusy ? "..." : "✕ NO - Reject"}
                        </button>
                      )}
                      {st === "approved" && (
                        <span style={{ color: "#28a745", fontWeight: 700, fontSize: 15 }}>✓ Link Sent</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
