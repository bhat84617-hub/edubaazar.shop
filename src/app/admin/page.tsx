"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Lock, ShieldCheck, ShoppingBag, IndianRupee, Users, LayoutDashboard, Store, Search, Check, X, Eye, Download, Inbox, ExternalLink, Gauge, RefreshCw } from "lucide-react";
import { getProductById } from "@/lib/products";
import type { Order } from "@/lib/store";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [approveModal, setApproveModal] = useState<Order | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const check = (retries = 5) => {
      fetch("/api/admin/session", { credentials: "same-origin" })
        .then((r) => {
          if (r.ok) setAuthed(true);
          else if (retries > 0) setTimeout(() => check(retries - 1), 600);
          else window.location.href = "/admin/login";
        })
        .catch(() => {
          if (retries > 0) setTimeout(() => check(retries - 1), 600);
          else window.location.href = "/admin/login";
        });
    };
    check();
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadError("");
    try {
      const r = await fetch("/api/admin/orders/status", { cache: "no-store", credentials: "same-origin" });
      if (!r.ok) {
        if (r.status === 401) { window.location.href = "/admin/login"; return; }
        const err = await r.json().catch(() => ({}));
        setLoadError(err.error || `Server error ${r.status}`);
        setLoading(false);
        return;
      }
      const data = await r.json() as { orders?: Order[] };
      setOrders(data.orders || []);
    } catch (e) {
      setLoadError(`Network error: ${e instanceof Error ? e.message : "unknown"}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    loadOrders();
    const t = setInterval(loadOrders, 30_000);
    return () => clearInterval(t);
  }, [authed, loadOrders]);

  const filtered = orders.filter((o) =>
    (o.name || "").toLowerCase().includes(q.toLowerCase()) ||
    (o.email || "").toLowerCase().includes(q.toLowerCase()) ||
    (o.orderId || "").toLowerCase().includes(q.toLowerCase()) ||
    (o.phone || "").includes(q)
  );

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const customers = new Set(orders.map((o) => o.email)).size;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const openApprove = (order: Order) => {
    const urls: Record<string, string> = {};
    (order.items || []).forEach((item) => { urls[item.id] = item.downloadUrl || ""; });
    setDownloadUrls(urls);
    setApproveModal(order);
  };

  const quickApprove = async (order: Order) => {
    const urls: Record<string, string> = {};
    let hasAllUrls = true;
    (order.items || []).forEach((item) => {
      const product = getProductById(item.id);
      urls[item.id] = item.downloadUrl || product?.downloadUrl || "";
      if (!urls[item.id] || !/^https?:\/\//i.test(urls[item.id])) hasAllUrls = false;
    });
    if (!hasAllUrls) {
      openApprove(order);
      return;
    }
    if (!confirm(`Order ${order.orderId} approve karna hai?\nCustomer: ${order.name}\nItems: ${(order.items || []).map((i) => i.name).join(", ")}`)) return;
    setBusyOrderId(order.orderId);
    try {
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: order.orderId, status: "approved", downloadUrls: urls }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      setOrders((prev) => prev.map((o) => o.orderId === order.orderId
        ? { ...o, status: "approved", items: o.items.map((item) => ({ ...item, downloadUrl: urls[item.id] || item.downloadUrl })) }
        : o));
      showToast(`${order.name} approved! Email sent.`);
    } catch (e) {
      showToast(`Approve failed: ${e instanceof Error ? e.message : "Unknown"}`, "error");
    }
    setBusyOrderId(null);
  };

  const confirmApprove = async () => {
    if (!approveModal) return;
    const missingLink = (approveModal.items || []).some((item) => !/^https?:\/\//i.test(downloadUrls[item.id] || item.downloadUrl || ""));
    if (missingLink) { showToast("Har item ke liye valid download URL required hai.", "error"); return; }
    setApproving(true);
    try {
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: approveModal.orderId, status: "approved", downloadUrls }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      setOrders((prev) => prev.map((o) => o.orderId === approveModal.orderId
        ? { ...o, status: "approved", items: o.items.map((item) => ({ ...item, downloadUrl: downloadUrls[item.id] || item.downloadUrl })) }
        : o));
      showToast(`${approveModal.name} approved! Email sent.`);
      setApproveModal(null);
    } catch (e) {
      showToast(`Approve failed: ${e instanceof Error ? e.message : "Unknown"}`, "error");
    }
    setApproving(false);
  };

  const rejectOrder = async (order: Order) => {
    if (!confirm(`Order ${order.orderId} reject karna hai?\nCustomer: ${order.name}`)) return;
    setBusyOrderId(order.orderId);
    try {
      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: order.orderId, status: "rejected" }),
      });
      if (!r.ok) throw new Error("Failed");
      setOrders((prev) => prev.map((o) => o.orderId === order.orderId ? { ...o, status: "rejected" } : o));
      showToast(`Order ${order.orderId} rejected.`, "error");
    } catch {
      showToast("Reject failed.", "error");
    }
    setBusyOrderId(null);
  };

  const exportCsv = () => {
    if (orders.length === 0) return alert("No orders to export");
    let csv = "Order ID,Customer Name,Email,Phone,Items,Total,Payment,UTR,Date,Status\n";
    orders.forEach((o) => {
      csv += `"${o.orderId}","${o.name}","${o.email}","${o.phone || ""}","${(o.items || []).map((i) => i.name).join("; ")}","₹${o.total}","${o.paymentMethod || "UPI"}","${o.utr || ""}","${new Date(o.date).toLocaleString("en-IN")}","${o.status}"\n`;
    });
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "edubazar_orders.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="dash-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
            <Lock size={48} style={{ color: "var(--line)", marginBottom: 14 }} />
            <h3 style={{ marginBottom: 8 }}>Admin access required</h3>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>Redirecting to login...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="brand">
          <img src="/logo/edulogo.jpeg" alt="EduBazar" />
          <span>EduBazar</span>
        </div>
        <span style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          <ShieldCheck size={14} style={{ verticalAlign: "-2px" }} /> Admin Panel
        </span>
        <a className="active" style={{ cursor: "pointer" }}>
          <LayoutDashboard size={18} /> <span>Dashboard</span>
        </a>
        <Link href="/admin/seo"><Gauge size={18} /> <span>SEO Control Center</span></Link>
        <Link href="/"><Store size={18} /> <span>View Store</span></Link>
        <Link href="/shop"><ShoppingBag size={18} /> <span>All Products</span></Link>
        <a style={{ cursor: "pointer", marginTop: "auto" }} onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); localStorage.removeItem("edubazar_admin"); window.location.href = "/"; }}>
          <Lock size={18} /> <span>Logout</span>
        </a>
      </aside>

      <div className="dash-main">
        <div className="dash-top">
          <h1><ShieldCheck size={20} style={{ verticalAlign: "-3px", color: "var(--accent)" }} /> Admin Dashboard</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {pendingCount > 0 && (
              <span className="badge pending" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Inbox size={13} /> {pendingCount} pending
              </span>
            )}
            <button className="btn btn-primary btn-sm" onClick={exportCsv}><Download size={14} /> Export CSV</button>
            <Link href="/shop" className="btn btn-outline btn-sm">View Store</Link>
          </div>
        </div>

        <div className="dash-stats">
          <div className="dash-stat"><div className="ic"><ShoppingBag size={20} /></div><div className="n">{orders.length}</div><div className="l">Total Orders</div></div>
          <div className="dash-stat"><div className="ic"><IndianRupee size={20} /></div><div className="n">₹{revenue.toLocaleString("en-IN")}</div><div className="l">Total Revenue</div></div>
          <div className="dash-stat"><div className="ic"><Users size={20} /></div><div className="n">{customers}</div><div className="l">Unique Customers</div></div>
          <div className="dash-stat"><div className="ic"><Search size={20} /></div><div className="n">{pendingCount}</div><div className="l">Pending</div></div>
        </div>

        <div className="dash-panel">
          <div className="ph">
            <h2>All Customer Orders</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="dash-search" placeholder="Search by name, email, order ID..." value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn btn-outline btn-sm" onClick={() => { setLoading(true); loadOrders(); }} title="Refresh">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {loadError && (
            <div style={{ padding: "12px 16px", marginBottom: 16, background: "#fef3cd", border: "1px solid #ffc107", borderRadius: 0, fontSize: 13, color: "#664d03" }}>
              <strong>Error:</strong> {loadError}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--muted)" }}>
              <RefreshCw size={32} style={{ color: "var(--accent)", marginBottom: 10, animation: "spin 1s linear infinite" }} />
              <p>Loading orders from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--muted)" }}>
              <Inbox size={42} style={{ color: "var(--line)", marginBottom: 10 }} />
              <p>{q ? "Koi order match nahi kar raha." : "Koi orders nahi mile."}</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>UTR</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const isPending = order.status === "pending";
                    const isRejected = order.status === "rejected";
                    const isBusy = busyOrderId === order.orderId;
                    return (
                      <tr key={order.orderId}>
                        <td><strong>{order.orderId}</strong></td>
                        <td>
                          <strong>{order.name || "—"}</strong>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{order.email}</div>
                        </td>
                        <td>{(order.items || []).map((i) => i.name).join(", ")}</td>
                        <td><strong>₹{order.total}</strong></td>
                        <td>{order.utr ? <code style={{ fontSize: 11, background: "var(--soft)", padding: "2px 6px", borderRadius: 0 }}>{order.utr}</code> : "—"}</td>
                        <td>{new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td>
                          <span className={`badge ${order.status === "approved" ? "approved" : order.status === "pending" ? "pending" : "rejected"}`}>
                            {order.status === "approved" ? "Approved" : order.status === "pending" ? "Pending" : "Rejected"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <button onClick={() => setSelected(order)} title="View details" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 0, fontWeight: 600, fontSize: 11.5, cursor: "pointer", background: "var(--ink)", color: "#fff" }}>
                              <Eye size={13} /> View
                            </button>
                            {isPending && (
                              <>
                                <button onClick={() => quickApprove(order)} disabled={isBusy} title="Approve with default download link" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 0, fontWeight: 600, fontSize: 11.5, cursor: "pointer", background: "#22a06b", color: "#fff", opacity: isBusy ? 0.6 : 1 }}>
                                  <Check size={13} /> {isBusy ? "Working..." : "Approve"}
                                </button>
                                <button onClick={() => openApprove(order)} title="Set custom download links" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 0, fontWeight: 600, fontSize: 11.5, cursor: "pointer", background: "#2c6ecb", color: "#fff" }}>
                                  <ExternalLink size={13} /> Custom
                                </button>
                                <button onClick={() => rejectOrder(order)} disabled={isBusy} title="Reject payment" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 0, fontWeight: 600, fontSize: 11.5, cursor: "pointer", background: "#e74c3c", color: "#fff", opacity: isBusy ? 0.6 : 1 }}>
                                  <X size={13} /> Reject
                                </button>
                              </>
                            )}
                            {isRejected && (
                              <>
                                <button onClick={() => quickApprove(order)} disabled={isBusy} title="Re-approve this order" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 0, fontWeight: 600, fontSize: 11.5, cursor: "pointer", background: "#22a06b", color: "#fff", opacity: isBusy ? 0.6 : 1 }}>
                                  <Check size={13} /> {isBusy ? "Working..." : "Re-Approve"}
                                </button>
                                <button onClick={() => openApprove(order)} title="Set custom download links" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 0, fontWeight: 600, fontSize: 11.5, cursor: "pointer", background: "#2c6ecb", color: "#fff" }}>
                                  <ExternalLink size={13} /> Custom
                                </button>
                                <button onClick={() => rejectOrder(order)} disabled={isBusy} title="Reject again" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "none", borderRadius: 0, fontWeight: 600, fontSize: 11.5, cursor: "pointer", background: "#e74c3c", color: "#fff", opacity: isBusy ? 0.6 : 1 }}>
                                  <X size={13} /> Reject
                                </button>
                              </>
                            )}
                            {order.status === "approved" && (
                              <span className="badge approved" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={12} /> Sent</span>
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

      {selected && (
        <div className="modal open" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-head">
              <h3>Order — {selected.orderId}</h3>
              <button className="sheet-x" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="spec-table" style={{ marginBottom: 16 }}>
                {[["Customer", selected.name || "—"], ["Email", selected.email || "—"], ["Phone", selected.phone || "—"], ["Total", `₹${selected.total}`], ["UTR", selected.utr || "—"], ["Status", selected.status]].map(([k, v]) => (
                  <div key={k} className="sum-row"><span>{k}</span><strong style={{ fontSize: 13 }}>{v}</strong></div>
                ))}
              </div>
              <h4 style={{ fontSize: 14, marginBottom: 10 }}>Items Purchased</h4>
              {(selected.items || []).map((item) => (
                <div key={item.id + item.name} className="co-item" style={{ marginBottom: 8 }}>
                  {item.img ? <img src={item.img} alt={item.name} /> : null}
                  <div style={{ flex: 1 }}>
                    <h5>{item.name}</h5>
                    <p>Qty: {item.qty} | ₹{item.price * item.qty}</p>
                    {item.downloadUrl && (
                      <a href={item.downloadUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--primary)" }}>
                        <ExternalLink size={12} /> Download link saved
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(selected.status === "pending" || selected.status === "rejected") && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={() => { setSelected(null); quickApprove(selected); }} style={{ flex: 1 }}>
                    <Check size={16} /> {selected.status === "rejected" ? "Re-Approve Order" : "Approve with Default Links"}
                  </button>
                  <button className="btn btn-outline" onClick={() => { setSelected(null); openApprove(selected); }}>
                    <ExternalLink size={16} /> Custom Links
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {approveModal && (
        <div className="modal open" onClick={() => setApproveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-head">
              <h3><ShieldCheck size={18} style={{ color: "var(--accent)" }} /> Approve — {approveModal.orderId}</h3>
              <button className="sheet-x" onClick={() => setApproveModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 16 }}>
                Paste the download link for each item below. Customer will get access after approval.
              </p>
              <div className="spec-table" style={{ marginBottom: 16 }}>
                {[["Customer", approveModal.name], ["Email", approveModal.email], ["Total", `₹${approveModal.total}`], ["UTR", approveModal.utr || "—"]].map(([k, v]) => (
                  <div key={k} className="sum-row"><span>{k}</span><strong style={{ fontSize: 13 }}>{v}</strong></div>
                ))}
              </div>
              {(approveModal.items || []).map((item) => {
                const product = getProductById(item.id);
                const defaultUrl = item.downloadUrl || product?.downloadUrl || "";
                return (
                  <div key={item.id} style={{ marginBottom: 16, padding: 14, background: "var(--soft)", borderRadius: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      {item.img && <img src={item.img} alt={item.name} style={{ width: 44, height: 44, borderRadius: 0, objectFit: "cover" }} />}
                      <div>
                        <h5 style={{ fontSize: 14, margin: 0 }}>{item.name}</h5>
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>₹{item.price} × {item.qty}</p>
                      </div>
                    </div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--body)", display: "block", marginBottom: 5 }}>
                      Download URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://terabox.com/... or Google Drive link"
                      value={downloadUrls[item.id] || ""}
                      onChange={(e) => setDownloadUrls({ ...downloadUrls, [item.id]: e.target.value })}
                      style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: 0, border: "1px solid var(--line)", background: "#fff" }}
                    />
                    {defaultUrl && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: 6, fontSize: 11 }}
                        onClick={() => setDownloadUrls({ ...downloadUrls, [item.id]: defaultUrl })}
                      >
                        Use product default link
                      </button>
                    )}
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={confirmApprove} disabled={approving} style={{ flex: 1 }}>
                  <Check size={16} /> {approving ? "Approving..." : "Approve & Send Access"}
                </button>
                <button className="btn btn-outline" onClick={() => setApproveModal(null)} disabled={approving}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          padding: "14px 22px", borderRadius: 0,
          background: toast.type === "success" ? "#1d7a4a" : "#c0392b",
          color: "#fff", fontSize: 14, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
