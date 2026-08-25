"use client";

import { useEffect, useState, useCallback } from "react";
import type { Order } from "@/lib/store";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 5000); };

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
    for (const item of o.items || []) {
      urls[item.id] = item.downloadUrl || "";
    }
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

  if (!authed) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #e9ecef", borderTopColor: "#181d27", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#6c757d", fontSize: 14 }}>Loading admin panel...</p>
      </div>
    </div>
  );

  const pending = orders.filter(o => (o.status || "").toLowerCase() === "pending");
  const approved = orders.filter(o => (o.status || "").toLowerCase() === "approved");
  const rejected = orders.filter(o => (o.status || "").toLowerCase() === "rejected");
  const totalRevenue = approved.reduce((sum, o) => sum + (o.total || 0), 0);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || (o.status || "").toLowerCase() === filter;
    const matchSearch = !search || o.name?.toLowerCase().includes(search.toLowerCase()) || o.email?.toLowerCase().includes(search.toLowerCase()) || o.orderId?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .action-btn:hover { transform: scale(1.05); }
        .filter-btn:hover { background: #181d27 !important; color: #fff !important; }
        .order-row:hover { background: #f8f9ff !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#181d27", padding: "0 32px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "#687975", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>E</div>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px" }}>EduBazar Admin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", padding: "8px 14px", borderRadius: 6, transition: "all 0.2s" }}>View Store</a>
            <a href="/admin/seo" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", padding: "8px 14px", borderRadius: 6 }}>SEO</a>
            <button onClick={load} style={{ background: "#687975", color: "#fff", border: "none", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 6 }}>Refresh</button>
            <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/"; }} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 6 }}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 32px" }}>
        {/* Flash Message */}
        {msg && (
          <div style={{ padding: "14px 20px", marginBottom: 24, background: "#d4edda", border: "1px solid #c3e6cb", color: "#155724", borderRadius: 8, fontWeight: 600, fontSize: 14, animation: "fadeIn 0.3s ease" }}>
            {msg}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
          <div className="stat-card" style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid #e9ecef", transition: "all 0.2s" }}>
            <div style={{ color: "#6c757d", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Total Orders</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#181d27" }}>{orders.length}</div>
          </div>
          <div className="stat-card" style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid #e9ecef", transition: "all 0.2s" }}>
            <div style={{ color: "#6c757d", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Pending</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#f0ad4e" }}>{pending.length}</div>
          </div>
          <div className="stat-card" style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid #e9ecef", transition: "all 0.2s" }}>
            <div style={{ color: "#6c757d", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Approved</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#28a745" }}>{approved.length}</div>
          </div>
          <div className="stat-card" style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid #e9ecef", transition: "all 0.2s" }}>
            <div style={{ color: "#6c757d", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Revenue</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#181d27" }}>₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", marginBottom: 24, border: "1px solid #e9ecef", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <button
                key={f}
                className="filter-btn"
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 20px",
                  border: "none",
                  borderRadius: 8,
                  background: filter === f ? "#181d27" : "#f0f2f5",
                  color: filter === f ? "#fff" : "#495057",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? `All (${orders.length})` : f === "pending" ? `Pending (${pending.length})` : f === "approved" ? `Approved (${approved.length})` : `Rejected (${rejected.length})`}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #e9ecef", borderRadius: 8, fontSize: 13, width: 280, outline: "none", background: "#f8f9fa" }}
          />
        </div>

        {/* Orders Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e9ecef", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#6c757d" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #e9ecef", borderTopColor: "#181d27", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#6c757d" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p style={{ fontSize: 15 }}>No orders found.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={th}>Order ID</th>
                    <th style={th}>Customer</th>
                    <th style={th}>Items</th>
                    <th style={th}>Amount</th>
                    <th style={th}>UTR</th>
                    <th style={th}>Status</th>
                    <th style={{ ...th, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => {
                    const s = (o.status || "").toLowerCase();
                    const isBusy = busy === o.orderId;
                    return (
                      <tr key={o.orderId} className="order-row" style={{ borderBottom: "1px solid #f0f2f5", animation: `fadeIn 0.3s ease ${i * 0.03}s both` }}>
                        <td style={td}>
                          <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f0f2f5", padding: "4px 8px", borderRadius: 4 }}>{o.orderId}</span>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{o.name}</div>
                          <div style={{ color: "#6c757d", fontSize: 12 }}>{o.email}</div>
                        </td>
                        <td style={td}>
                          <div style={{ fontSize: 13, maxWidth: 200 }}>
                            {(o.items || []).map(i => i.name).join(", ")}
                          </div>
                        </td>
                        <td style={td}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#181d27" }}>₹{o.total}</span>
                        </td>
                        <td style={td}>
                          <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f0f2f5", padding: "4px 8px", borderRadius: 4 }}>{o.utr || "—"}</span>
                        </td>
                        <td style={td}>
                          <span style={{
                            padding: "5px 14px",
                            borderRadius: 20,
                            fontWeight: 600,
                            fontSize: 12,
                            display: "inline-block",
                            background: s === "approved" ? "#d4edda" : s === "pending" ? "#fff3cd" : "#f8d7da",
                            color: s === "approved" ? "#155724" : s === "pending" ? "#856404" : "#721c24",
                          }}>
                            {s === "approved" ? "✓ Approved" : s === "pending" ? "⏳ Pending" : "✕ Rejected"}
                          </span>
                        </td>
                        <td style={{ ...td, textAlign: "center" }}>
                          {(s === "pending" || s === "rejected") && (
                            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                              <button
                                disabled={isBusy}
                                onClick={() => approve(o)}
                                className="action-btn"
                                style={{
                                  padding: "8px 18px",
                                  background: isBusy ? "#6c757d" : "#28a745",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  fontWeight: 600,
                                  fontSize: 13,
                                  cursor: isBusy ? "not-allowed" : "pointer",
                                  transition: "all 0.2s",
                                }}
                              >
                                {isBusy ? "..." : "✓ Approve"}
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => reject(o)}
                                className="action-btn"
                                style={{
                                  padding: "8px 18px",
                                  background: isBusy ? "#6c757d" : "#dc3545",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  fontWeight: 600,
                                  fontSize: 13,
                                  cursor: isBusy ? "not-allowed" : "pointer",
                                  transition: "all 0.2s",
                                }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}
                          {s === "approved" && (
                            <span style={{ color: "#28a745", fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              Done
                            </span>
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
    </div>
  );
}

const th: React.CSSProperties = { padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 13, verticalAlign: "middle" };
