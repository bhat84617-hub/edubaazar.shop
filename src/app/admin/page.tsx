"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck, ShoppingBag, IndianRupee, Users, LayoutDashboard, Store, Search, Check, X, Eye, Download, Inbox, ExternalLink, Gauge, AlertTriangle, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/config";
import { getProductById } from "@/lib/products";
import type { Order } from "@/lib/store";

export default function AdminPage() {
  const { orders: localOrders, showToast, mounted } = useStore();
  const [authed, setAuthed] = useState(false);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [approveModal, setApproveModal] = useState<Order | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState(false);
  const [quickApprovingId, setQuickApprovingId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState("");

  const loadRemoteOrders = async () => {
    setLoadError("");
    setDebugInfo("API se orders load ho rahe hain...");
    try {
      const response = await fetch("/api/admin/orders/status", { cache: "no-store", credentials: "same-origin" });
      if (response.ok) {
        const result = await response.json() as { orders?: Order[] };
        const list = result.orders || [];
        setRemoteOrders(list);
        setDebugInfo(`API se ${list.length} orders mile.`);
        setLoading(false);
        return;
      }
      const errText = await response.text().catch(() => "");
      setDebugInfo(`API failed (${response.status}): ${errText.slice(0, 200)}`);
    } catch (e) {
      setDebugInfo(`API error: ${e instanceof Error ? e.message : "unknown"}`);
    }

    // Fallback: read orders directly from Supabase using anon key
    setDebugInfo("Supabase se direct load ho raha hai...");
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((o: Record<string, unknown>) => ({
        orderId: o.order_id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        items: typeof o.items === "string" ? JSON.parse(o.items as string) : o.items,
        total: o.total,
        status: o.status,
        paymentMethod: o.payment_method,
        utr: o.utr ?? "",
        date: o.date,
      })) as Order[];
      setRemoteOrders(mapped);
      setDebugInfo(`Supabase se ${mapped.length} orders mile (fallback).`);
    } catch {
      setLoadError("Orders load nahi ho paaye. Supabase connection check karein.");
      setDebugInfo("Dono methods fail hue. Supabase table 'orders' exist karti hai?");
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = (retries = 3) => {
      fetch("/api/admin/session", { credentials: "same-origin" })
        .then((response) => {
          if (response.ok) {
            setAuthed(true);
          } else if (retries > 0) {
            setTimeout(() => checkSession(retries - 1), 500);
          } else {
            setAuthed(false);
          }
        })
        .catch(() => {
          if (retries > 0) {
            setTimeout(() => checkSession(retries - 1), 500);
          } else {
            setAuthed(false);
          }
        });
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    const initialRefresh = window.setTimeout(loadRemoteOrders, 0);
    const refreshTimer = window.setInterval(loadRemoteOrders, 30_000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(refreshTimer);
    };
  }, [authed]);

  const orders: Order[] = (mounted && remoteOrders.length > 0 ? remoteOrders : localOrders).filter(Boolean);

  const filtered = orders.filter((o) =>
    (o.name || "").toLowerCase().includes(q.toLowerCase()) ||
    (o.email || "").toLowerCase().includes(q.toLowerCase()) ||
    (o.orderId || "").toLowerCase().includes(q.toLowerCase()) ||
    (o.phone || "").includes(q)
  );

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const customers = new Set(orders.map((o) => o.email)).size;

  const openApprove = (order: Order) => {
    const urls: Record<string, string> = {};
    (order.items || []).forEach((item) => {
      urls[item.id] = item.downloadUrl || "";
    });
    setDownloadUrls(urls);
    setApproveModal(order);
  };

  const confirmApprove = async () => {
    if (!approveModal) return;
    const missingLink = (approveModal.items || []).some((item) => !/^https?:\/\//i.test(downloadUrls[item.id] || item.downloadUrl || ""));
    if (missingLink) {
      showToast("Har item ke liye valid download URL required hai.", "error");
      return;
    }
    setApproving(true);
    try {
      const response = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: approveModal.orderId, status: "approved", downloadUrls }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Order approval failed");
      }
      setRemoteOrders((current) => {
        const source = current.length > 0 ? current : orders;
        return source.map((order) => order.orderId === approveModal.orderId
          ? { ...order, status: "approved", items: order.items.map((item) => ({ ...item, downloadUrl: downloadUrls[item.id] || item.downloadUrl })) }
          : order);
      });
    } catch {
      showToast("Payment approve nahi hui. Database/settings check karein.", "error");
      setApproving(false);
      return;
    }
    showToast("Order approved with download links!");
    setApproveModal(null);
    setApproving(false);
  };

  const approve = async (order: Order) => {
    openApprove(order);
  };

  const quickApprove = async (order: Order) => {
    if (!confirm(`Order ${order.orderId} approve karna hai? Customer ko email jayega.`)) return;
    setQuickApprovingId(order.orderId);
    const urls: Record<string, string> = {};
    (order.items || []).forEach((item) => {
      const product = getProductById(item.id);
      urls[item.id] = item.downloadUrl || product?.downloadUrl || "";
    });
    try {
      const response = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: order.orderId, status: "approved", downloadUrls: urls }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Approval failed");
      }
      setRemoteOrders((current) =>
        current.map((o) => o.orderId === order.orderId
          ? { ...o, status: "approved", items: o.items.map((item) => ({ ...item, downloadUrl: urls[item.id] || item.downloadUrl })) }
          : o)
      );
      showToast(`${order.name} ka order approved! Email bhej diya.`);
    } catch (err) {
      showToast(`Approve failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
    setQuickApprovingId(null);
  };

  const reject = async (order: Order) => {
    if (!confirm("Reject this payment?")) return;
    const response = await fetch("/api/admin/orders/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ orderId: order.orderId, status: "rejected" }),
    });
    if (!response.ok) {
      showToast("Payment reject nahi hui. Database/settings check karein.", "error");
      return;
    }
    setRemoteOrders((current) => current.map((item) => item.orderId === order.orderId ? { ...item, status: "rejected" } : item));
    showToast("Order rejected", "error");
  };

  const exportCsv = () => {
    if (orders.length === 0) return alert("No orders to export");
    let csv = "Order ID,Customer Name,Email,Phone,Items,Total,Payment,Date,Status\n";
    orders.forEach((o) => {
      csv += `"${o.orderId}","${o.name}","${o.email}","${o.phone || ""}","${(o.items || []).map((i) => i.name).join("; ")}","₹${o.total}","${o.paymentMethod || "UPI"}","${new Date(o.date).toLocaleString("en-IN")}","${o.status}"\n`;
    });
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "edubazar_orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="dash-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
            <Lock size={48} style={{ color: "var(--line)", marginBottom: 14 }} />
            <h3 style={{ marginBottom: 8 }}>Admin access required</h3>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>Please login to access the dashboard.</p>
            <Link href="/admin/login" className="btn btn-primary">Admin Login</Link>
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
          <div style={{ display: "flex", gap: 10 }}>
            {orders.filter((o) => o.status === "pending").length > 0 && (
              <span className="badge pending" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Inbox size={13} /> {orders.filter((o) => o.status === "pending").length} pending approval
              </span>
            )}
            <button className="btn btn-primary btn-sm" onClick={exportCsv}>
              <Download size={14} /> Export CSV
            </button>
            <Link href="/shop" className="btn btn-outline btn-sm">View Store</Link>
          </div>
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <div className="ic"><ShoppingBag size={20} /></div>
            <div className="n">{orders.length}</div>
            <div className="l">Total Orders</div>
          </div>
          <div className="dash-stat">
            <div className="ic"><IndianRupee size={20} /></div>
            <div className="n">₹{revenue.toLocaleString("en-IN")}</div>
            <div className="l">Total Revenue</div>
          </div>
          <div className="dash-stat">
            <div className="ic"><Users size={20} /></div>
            <div className="n">{customers}</div>
            <div className="l">Unique Customers</div>
          </div>
          <div className="dash-stat">
            <div className="ic"><Search size={20} /></div>
            <div className="n">{orders.filter((o) => o.status === "pending").length}</div>
            <div className="l">Pending</div>
          </div>
        </div>

        {debugInfo && (
          <div style={{ padding: "8px 14px", marginBottom: 14, background: "#e8f4fd", border: "1px solid #b6d4fe", borderRadius: 6, fontSize: 12, color: "#084298", fontFamily: "monospace" }}>
            Debug: {debugInfo}
          </div>
        )}

        <div className="dash-panel">
          <div className="ph">
            <h2>All Customer Orders</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="dash-search" placeholder="Search by name, email, order ID..." value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn btn-outline btn-sm" onClick={() => { setLoading(true); loadRemoteOrders(); }} title="Refresh orders">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {loadError && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 16px", marginBottom: 16, background: "#fef3cd", border: "1px solid #ffc107", borderRadius: 8, fontSize: 13, color: "#664d03" }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Orders load nahi ho paaye.</strong>
                <div style={{ marginTop: 4 }}>{loadError}</div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  Possible fixes: (1) Vercel Dashboard me SUPABASE_SERVICE_ROLE_KEY add karein, (2) Supabase me orders table ki RLS policies check karein.
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--muted)" }}>
              <RefreshCw size={32} style={{ color: "var(--accent)", marginBottom: 10 }} />
              <p>Loading orders from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--muted)" }}>
              <Inbox size={42} style={{ color: "var(--line)", marginBottom: 10 }} />
              <p>{q ? "Koi order match nahi kar raha is search se." : "Koi orders nahi mile."}</p>
              {!q && (
                <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6 }}>
                  <p>Agar customer ne order kiya hai lekin yahan nahi dikh raha:</p>
                  <p>1. Customer ko login karne bolo → Account page pe order dikhega</p>
                  <p>2. Supabase Dashboard me <code>orders</code> table check karo</p>
                  <p>3. Browser me F12 → Console me errors dekho</p>
                </div>
              )}
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
                    return (
                      <tr key={order.orderId}>
                        <td><strong>{order.orderId}</strong></td>
                        <td>
                          <strong>{order.name || "—"}</strong>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{order.email}</div>
                        </td>
                        <td>{(order.items || []).map((i) => i.name).join(", ")}</td>
                        <td><strong>₹{order.total}</strong></td>
                        <td>{order.utr ? <code style={{ fontSize: 11, background: "var(--soft)", padding: "2px 6px", borderRadius: 5 }}>{order.utr}</code> : "—"}</td>
                        <td>{new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td>
                          <span className={`badge ${order.status === "approved" ? "approved" : order.status === "pending" ? "pending" : "rejected"}`}>
                            {order.status === "approved" ? "Approved" : order.status === "pending" ? "Pending" : "Rejected"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(order)} title="View order and UTR">
                              <Eye size={13} /> View
                            </button>
                            {isPending && (
                              <>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => quickApprove(order)}
                                  disabled={quickApprovingId === order.orderId}
                                  title="Seedha approve karo with default download link"
                                  style={quickApprovingId === order.orderId ? { opacity: 0.6 } : {}}
                                >
                                  <Check size={13} /> {quickApprovingId === order.orderId ? "Approving..." : "Approve"}
                                </button>
                                <button className="btn btn-outline btn-sm" onClick={() => approve(order)} title="Custom link ke saath approve karo">
                                  <ExternalLink size={13} /> Custom
                                </button>
                                <button className="btn btn-outline btn-sm" onClick={() => reject(order)} title="Reject payment">
                                  <X size={13} /> Reject
                                </button>
                              </>
                            )}
                            {order.status === "approved" && (
                              <span className="badge approved" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <Check size={13} /> Access Sent
                              </span>
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
              <h3>Order Details — {selected.orderId}</h3>
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
              {selected.status === "pending" && (
                <button className="btn btn-primary btn-block" onClick={() => { setSelected(null); approve(selected); }}>
                  <Check size={16} /> Verify UTR & Approve This Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {approveModal && (
        <div className="modal open" onClick={() => setApproveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-head">
              <h3><ShieldCheck size={18} style={{ color: "var(--accent)" }} /> Approve Order — {approveModal.orderId}</h3>
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
              {(approveModal.items || []).map((item) => (
                <div key={item.id} style={{ marginBottom: 16, padding: 14, background: "var(--soft)", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {item.img && <img src={item.img} alt={item.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }} />}
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
                    placeholder="https://drive.google.com/file/d/... or MediaFire link"
                    value={downloadUrls[item.id] || ""}
                    onChange={(e) => setDownloadUrls({ ...downloadUrls, [item.id]: e.target.value })}
                    style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "#fff" }}
                  />
                  {item.downloadUrl && (
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                      Default from product: <a href={item.downloadUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>{item.downloadUrl.slice(0, 50)}...</a>
                    </p>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={confirmApprove} disabled={approving} style={{ flex: 1 }}>
                  <Check size={16} /> {approving ? "Approving..." : "Approve & Send Access"}
                </button>
                <button className="btn btn-outline" onClick={() => setApproveModal(null)} disabled={approving}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}