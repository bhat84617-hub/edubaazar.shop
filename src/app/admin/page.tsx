"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck, ShoppingBag, IndianRupee, Users, LayoutDashboard, Store, Search, Check, X, Eye, Download, Inbox } from "lucide-react";
import { supabase } from "@/lib/config";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/store";

export default function AdminPage() {
  const { orders: localOrders, updateOrderStatus, showToast, mounted } = useStore();
  const [authed, setAuthed] = useState(false);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    setAuthed(localStorage.getItem("edubazar_admin") === "true");
  }, []);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const { data } = await supabase.from("orders").select("*").order("date", { ascending: false });
        if (data && data.length > 0) {
          setRemoteOrders(
            data.map((o) => ({
              orderId: o.order_id,
              name: o.name,
              email: o.email,
              phone: o.phone,
              items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
              total: o.total,
              status: o.status,
              paymentMethod: o.payment_method,
              utr: o.utr ?? "",
              date: o.date,
            }))
          );
        }
      } catch {
        // fallback to local
      }
    })();
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

  const sendStatusEmail = (orderId: string, name: string, email: string, status: string) => {
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "order-status", orderId, name, email, status }),
    }).catch(() => {});
  };

  const approve = async (order: Order) => {
    if (!confirm("Approve this payment? Course access will be given to customer.")) return;
    await updateOrderStatus(order.orderId, "approved");
    sendStatusEmail(order.orderId, order.name, order.email, "approved");
    showToast("Order approved!");
  };

  const reject = async (order: Order) => {
    if (!confirm("Reject this payment?")) return;
    await updateOrderStatus(order.orderId, "rejected");
    sendStatusEmail(order.orderId, order.name, order.email, "rejected");
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
        <Link href="/"><Store size={18} /> <span>View Store</span></Link>
        <Link href="/shop"><ShoppingBag size={18} /> <span>All Products</span></Link>
        <a style={{ cursor: "pointer", marginTop: "auto" }} onClick={() => { localStorage.removeItem("edubazar_admin"); window.location.href = "/"; }}>
          <Lock size={18} /> <span>Logout</span>
        </a>
      </aside>

      <div className="dash-main">
        <div className="dash-top">
          <h1><ShieldCheck size={20} style={{ verticalAlign: "-3px", color: "var(--accent)" }} /> Admin Dashboard</h1>
          <div style={{ display: "flex", gap: 10 }}>
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

        <div className="dash-panel">
          <div className="ph">
            <h2>All Customer Orders</h2>
            <input className="dash-search" placeholder="Search by name, email, order ID..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--muted)" }}>
              <Inbox size={42} style={{ color: "var(--line)", marginBottom: 10 }} />
              <p>No orders found.</p>
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
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-mini info" onClick={() => setSelected(order)} title="View">
                              <Eye size={13} />
                            </button>
                            {isPending && (
                              <>
                                <button className="btn-mini ok" onClick={() => approve(order)} title="Approve">
                                  <Check size={13} />
                                </button>
                                <button className="btn-mini no" onClick={() => reject(order)} title="Reject">
                                  <X size={13} />
                                </button>
                              </>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}