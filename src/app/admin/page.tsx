"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductById } from "@/lib/products";
import type { Order, OrderItem } from "@/lib/store";

type Tab = "orders" | "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("orders");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [approveOrder, setApproveOrder] = useState<Order | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    let alive = true;
    const check = (n = 0) => {
      fetch("/api/admin/session", { credentials: "same-origin" })
        .then((r) => {
          if (!alive) return;
          if (r.ok) setAuthed(true);
          else if (n < 5) setTimeout(() => check(n + 1), 800);
          else window.location.href = "/admin/login";
        })
        .catch(() => {
          if (!alive) return;
          if (n < 5) setTimeout(() => check(n + 1), 800);
          else window.location.href = "/admin/login";
        });
    };
    check();
    return () => { alive = false; };
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/orders/status", { cache: "no-store", credentials: "same-origin" });
      if (r.status === 401) { window.location.href = "/admin/login"; return; }
      if (!r.ok) { setError(`Error ${r.status}`); setLoading(false); return; }
      const d = await r.json() as { orders?: Order[] };
      setOrders(d.orders || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchOrders();
    const t = setInterval(fetchOrders, 30000);
    return () => clearInterval(t);
  }, [authed, fetchOrders]);

  const norm = (s: string) => (s || "").toLowerCase().trim();

  const filtered = orders.filter((o) => {
    if (tab !== "orders" && norm(o.status) !== tab) return false;
    if (!search) return true;
    const q = norm(search);
    return norm(o.name).includes(q) || norm(o.email).includes(q) || norm(o.orderId).includes(q) || (o.phone || "").includes(search);
  });

  const pendingCount = orders.filter((o) => norm(o.status) === "pending").length;
  const approvedCount = orders.filter((o) => norm(o.status) === "approved").length;
  const rejectedCount = orders.filter((o) => norm(o.status) === "rejected").length;
  const revenue = orders.reduce((s, o) => s + (norm(o.status) === "approved" ? o.total || 0 : 0), 0);
  const uniqueCustomers = new Set(orders.map((o) => o.email)).size;

  const doApprove = async (order: Order, urls: Record<string, string>) => {
    const items = order.items || [];
    const missing = items.some((item) => !/^https?:\/\//i.test(urls[item.id] || item.downloadUrl || ""));
    if (missing) { flash("Har item ke liye download URL required hai!", false); return; }
    setBusy(order.orderId);
    try {
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: order.orderId, status: "approved", downloadUrls: urls }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || `Error ${r.status}`);
      }
      setOrders((prev) => prev.map((o) => o.orderId === order.orderId
        ? { ...o, status: "approved", items: o.items.map((item) => ({ ...item, downloadUrl: urls[item.id] || item.downloadUrl })) }
        : o));
      flash(`${order.name} approved! Email sent.`);
      setApproveOrder(null);
    } catch (e) {
      flash(`Failed: ${e instanceof Error ? e.message : "unknown"}`, false);
    }
    setBusy(null);
  };

  const doReject = async (order: Order) => {
    if (!confirm(`Reject ${order.orderId} (${order.name})?`)) return;
    setBusy(order.orderId);
    try {
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: order.orderId, status: "rejected" }),
      });
      if (!r.ok) throw new Error("Failed");
      setOrders((prev) => prev.map((o) => o.orderId === order.orderId ? { ...o, status: "rejected" } : o));
      flash(`Order rejected.`, false);
    } catch {
      flash("Reject failed.", false);
    }
    setBusy(null);
  };

  const quickApprove = async (order: Order) => {
    const urls: Record<string, string> = {};
    let allGood = true;
    (order.items || []).forEach((item) => {
      const p = getProductById(item.id);
      urls[item.id] = item.downloadUrl || p?.downloadUrl || "";
      if (!urls[item.id] || !/^https?:\/\//i.test(urls[item.id])) allGood = false;
    });
    if (!allGood) {
      openApproveModal(order);
      return;
    }
    if (!confirm(`Approve ${order.name}?\nItems: ${(order.items || []).map((i) => i.name).join(", ")}`)) return;
    await doApprove(order, urls);
  };

  const openApproveModal = (order: Order) => {
    const urls: Record<string, string> = {};
    (order.items || []).forEach((item) => { urls[item.id] = item.downloadUrl || ""; });
    setDownloadUrls(urls);
    setApproveOrder(order);
  };

  const exportCsv = () => {
    if (!orders.length) return alert("No orders");
    let csv = "Order ID,Name,Email,Phone,Items,Total,UTR,Date,Status\n";
    orders.forEach((o) => {
      csv += `"${o.orderId}","${o.name}","${o.email}","${o.phone || ""}","${(o.items || []).map((i) => i.name).join("; ")}","${o.total}","${o.utr || ""}","${new Date(o.date).toLocaleDateString("en-IN")}","${o.status}"\n`;
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "orders.csv"; a.click();
  };

  const btnStyle = (bg: string): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px",
    border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer",
    background: bg, color: "#fff", letterSpacing: 0.3,
  });

  const statusBadge = (s: string) => {
    const v = norm(s);
    const bg = v === "approved" ? "#d4edda" : v === "pending" ? "#fff3cd" : "#f8d7da";
    const fg = v === "approved" ? "#155724" : v === "pending" ? "#856404" : "#721c24";
    const label = v === "approved" ? "Approved" : v === "pending" ? "Pending" : "Rejected";
    return <span style={{ display: "inline-block", padding: "3px 10px", fontWeight: 700, fontSize: 11, background: bg, color: fg }}>{label}</span>;
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <p style={{ color: "#888", fontSize: 14 }}>Checking access...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* TOPBAR */}
      <div style={{ background: "#181d27", color: "#fff", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo/edulogo.jpeg" alt="" style={{ height: 32 }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>Admin Dashboard</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/" style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>View Store</a>
          <button onClick={exportCsv} style={btnStyle("#2c6ecb")}>Export CSV</button>
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); localStorage.removeItem("edubazar_admin"); window.location.href = "/"; }} style={btnStyle("#666")}>Logout</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {[
          { label: "Total Orders", value: orders.length, bg: "#fff" },
          { label: "Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, bg: "#d4edda" },
          { label: "Customers", value: uniqueCustomers, bg: "#fff" },
          { label: "Pending", value: pendingCount, bg: pendingCount > 0 ? "#fff3cd" : "#fff" },
          { label: "Approved", value: approvedCount, bg: "#d4edda" },
          { label: "Rejected", value: rejectedCount, bg: "#f8d7da" },
        ].map((s) => (
          <div key={s.label} style={{ padding: 18, background: s.bg, border: "1px solid #d5d7da" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#181d27" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS + SEARCH */}
      <div style={{ padding: "0 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 0 }}>
          {([["orders", "All"], ["pending", `Pending (${pendingCount})`], ["approved", `Approved (${approvedCount})`], ["rejected", `Rejected (${rejectedCount})`]] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "9px 18px", border: "1px solid #d5d7da", borderRight: "none",
                background: tab === key ? "#181d27" : "#fff",
                color: tab === key ? "#fff" : "#181d27",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            style={{ padding: "9px 14px", border: "1px solid #d5d7da", fontSize: 13, width: 240, outline: "none" }}
          />
          <button onClick={() => { setLoading(true); fetchOrders(); }} style={btnStyle("#181d27")}>Refresh</button>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div style={{ padding: "0 24px 40px" }}>
        <div style={{ background: "#fff", border: "1px solid #d5d7da", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#888" }}>Loading orders...</div>
          ) : error ? (
            <div style={{ padding: 30, background: "#fdecea", color: "#721c24", fontSize: 13 }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#888" }}>{search ? "No matching orders" : "No orders yet"}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8f8f8" }}>
                    {["Order ID", "Customer", "Items", "Total", "UTR", "Date", "Status", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid #eee" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const s = norm(order.status);
                    const isBusy = busy === order.orderId;
                    return (
                      <tr key={order.orderId} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 12, fontWeight: 700, fontSize: 12, fontFamily: "monospace" }}>{order.orderId}</td>
                        <td style={{ padding: 12 }}>
                          <div style={{ fontWeight: 600 }}>{order.name || "—"}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>{order.email}</div>
                        </td>
                        <td style={{ padding: 12, maxWidth: 200 }}>{(order.items || []).map((i) => i.name).join(", ")}</td>
                        <td style={{ padding: 12, fontWeight: 700 }}>₹{order.total}</td>
                        <td style={{ padding: 12 }}>
                          {order.utr ? <code style={{ fontSize: 11, background: "#f5f5f5", padding: "2px 6px" }}>{order.utr}</code> : "—"}
                        </td>
                        <td style={{ padding: 12, fontSize: 12, color: "#666" }}>{new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td style={{ padding: 12 }}>{statusBadge(order.status)}</td>
                        <td style={{ padding: 12 }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button onClick={() => setViewOrder(order)} style={btnStyle("#333")}>View</button>
                            {s === "pending" && (
                              <>
                                <button onClick={() => quickApprove(order)} disabled={isBusy} style={{ ...btnStyle("#22a06b"), opacity: isBusy ? 0.5 : 1 }}>
                                  {isBusy ? "..." : "Approve"}
                                </button>
                                <button onClick={() => openApproveModal(order)} style={btnStyle("#2c6ecb")}>Custom</button>
                                <button onClick={() => doReject(order)} disabled={isBusy} style={{ ...btnStyle("#dc3545"), opacity: isBusy ? 0.5 : 1 }}>Reject</button>
                              </>
                            )}
                            {s === "rejected" && (
                              <>
                                <button onClick={() => quickApprove(order)} disabled={isBusy} style={{ ...btnStyle("#22a06b"), opacity: isBusy ? 0.5 : 1 }}>
                                  {isBusy ? "..." : "Re-Approve"}
                                </button>
                                <button onClick={() => openApproveModal(order)} style={btnStyle("#2c6ecb")}>Custom</button>
                                <button onClick={() => doReject(order)} disabled={isBusy} style={{ ...btnStyle("#dc3545"), opacity: isBusy ? 0.5 : 1 }}>Reject</button>
                              </>
                            )}
                            {s === "approved" && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "#d4edda", color: "#155724", fontWeight: 700, fontSize: 11 }}>✓ Sent</span>
                            )}
                          </div>
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

      {/* VIEW MODAL */}
      {viewOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewOrder(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", maxWidth: 520, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Order {viewOrder.orderId}</h3>
              <button onClick={() => setViewOrder(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                {[["Customer", viewOrder.name], ["Email", viewOrder.email], ["Phone", viewOrder.phone || "—"], ["Total", `₹${viewOrder.total}`], ["UTR", viewOrder.utr || "—"], ["Status", viewOrder.status], ["Date", new Date(viewOrder.date).toLocaleString("en-IN")]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                    <span style={{ color: "#888" }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Items</h4>
              {(viewOrder.items || []).map((item: OrderItem) => (
                <div key={item.id} style={{ display: "flex", gap: 12, padding: 10, background: "#f9f9f9", marginBottom: 8, alignItems: "center" }}>
                  {item.img && <img src={item.img} alt="" style={{ width: 48, height: 48, objectFit: "cover" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>₹{item.price} × {item.qty}</div>
                    {item.downloadUrl && (
                      <a href={item.downloadUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#2c6ecb" }}>
                        Download link ✓
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(norm(viewOrder.status) === "pending" || norm(viewOrder.status) === "rejected") && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={() => { setViewOrder(null); quickApprove(viewOrder); }} style={{ ...btnStyle("#22a06b"), flex: 1, justifyContent: "center" }}>
                    {norm(viewOrder.status) === "rejected" ? "Re-Approve" : "Approve with Default Links"}
                  </button>
                  <button onClick={() => { setViewOrder(null); openApproveModal(viewOrder); }} style={{ ...btnStyle("#2c6ecb"), justifyContent: "center" }}>Custom Links</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setApproveOrder(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", maxWidth: 560, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Approve {approveOrder.orderId}</h3>
              <button onClick={() => setApproveOrder(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                {[["Customer", approveOrder.name], ["Email", approveOrder.email], ["Total", `₹${approveOrder.total}`], ["UTR", approveOrder.utr || "—"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                    <span style={{ color: "#888" }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              {(approveOrder.items || []).map((item) => {
                const product = getProductById(item.id);
                const def = item.downloadUrl || product?.downloadUrl || "";
                return (
                  <div key={item.id} style={{ marginBottom: 16, padding: 14, background: "#f9f9f9" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      {item.img && <img src={item.img} alt="" style={{ width: 40, height: 40, objectFit: "cover" }} />}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>₹{item.price} × {item.qty}</div>
                      </div>
                    </div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Download URL</label>
                    <input
                      value={downloadUrls[item.id] || ""}
                      onChange={(e) => setDownloadUrls((p) => ({ ...p, [item.id]: e.target.value }))}
                      placeholder="https://terabox.com/..."
                      style={{ width: "100%", padding: 10, border: "1px solid #d5d7da", fontSize: 13, boxSizing: "border-box" }}
                    />
                    {def && (
                      <button
                        onClick={() => setDownloadUrls((p) => ({ ...p, [item.id]: def }))}
                        style={{ marginTop: 6, padding: "4px 10px", background: "#e8f4fd", color: "#084298", border: "1px solid #b6d4fe", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                      >
                        Use product default
                      </button>
                    )}
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => doApprove(approveOrder, downloadUrls)}
                  disabled={busy !== null}
                  style={{ ...btnStyle("#22a06b"), flex: 1, justifyContent: "center", opacity: busy ? 0.5 : 1, padding: "12px 0" }}
                >
                  {busy ? "Approving..." : "Approve & Send Access"}
                </button>
                <button onClick={() => setApproveOrder(null)} style={{ ...btnStyle("#666"), padding: "12px 20px" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          padding: "14px 24px", background: toast.ok ? "#155724" : "#721c24",
          color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
