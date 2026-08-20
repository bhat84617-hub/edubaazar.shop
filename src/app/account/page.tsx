"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Download, IndianRupee, BookOpen, LayoutDashboard, Store, Heart, LogOut, Settings, DownloadCloud, Clock, XCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/config";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/store";

type PublicOrder = {
  orderId: string;
  email: string;
  items: { name: string; price: number; img: string; qty: number; downloadUrl?: string | null }[];
  total: number;
  status: string;
  date: string;
};

export default function AccountPage() {
  const { user, logout, orders: localOrders } = useStore();
  const [remoteOrders, setRemoteOrders] = useState<PublicOrder[]>([]);
  const [tab, setTab] = useState<"orders" | "wishlist" | "settings">("orders");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase.from("orders").select("*").eq("email", user.email).order("date", { ascending: false });
        if (data && data.length > 0) {
          setRemoteOrders(
            data.map((o) => ({
              orderId: o.order_id,
              email: o.email,
              items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
              total: o.total,
              status: o.status,
              date: o.date,
            }))
          );
        }
      } catch {
        // fallback to local orders
      }
    })();
  }, [user]);

  const merged: (PublicOrder | Order)[] = useMemo(() => {
    const local = localOrders.filter((o) => user && o.email.toLowerCase() === user.email.toLowerCase());
    if (remoteOrders.length > 0) return remoteOrders as PublicOrder[];
    return local;
  }, [localOrders, remoteOrders, user]);

  const filtered = merged.filter((o) =>
    (o.orderId || "").toLowerCase().includes(q.toLowerCase()) ||
    (o.items || []).some((i: { name?: string }) => (i.name || "").toLowerCase().includes(q.toLowerCase()))
  );

  const totalSpent = merged.reduce((s, o) => s + (o.total || 0), 0);
  const totalDownloads = merged.flatMap((o) => o.items || []).length;
  const approved = merged.filter((o) => o.status === "approved").length;

  if (!user) {
    return (
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="dash-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
            <LayoutDashboard size={48} style={{ color: "var(--line)", marginBottom: 14 }} />
            <h3 style={{ marginBottom: 8 }}>Login Required</h3>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>Please login to view your dashboard.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/login" className="btn btn-primary">Login</Link>
              <Link href="/register" className="btn btn-outline">Sign Up</Link>
            </div>
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
        <a className="active" onClick={() => setTab("orders")} style={{ cursor: "pointer" }}>
          <LayoutDashboard size={18} /> <span>Dashboard</span>
        </a>
        <Link href="/shop"><Store size={18} /> <span>Browse Courses</span></Link>
        <Link href="/wishlist"><Heart size={18} /> <span>Wishlist</span></Link>
        <a onClick={() => setTab("settings")} style={{ cursor: "pointer" }}>
          <Settings size={18} /> <span>Settings</span>
        </a>
        <a onClick={() => logout()} style={{ cursor: "pointer", marginTop: "auto" }}>
          <LogOut size={18} /> <span>Logout</span>
        </a>
      </aside>

      <div className="dash-main">
        <div className="dash-top">
          <h1>Welcome, {user.name.split(" ")[0]} 👋</h1>
          <span style={{ color: "var(--muted)", fontSize: 13}}>{user.email}</span>
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <div className="ic"><ShoppingBag size={20} /></div>
            <div className="n">{merged.length}</div>
            <div className="l">Total Orders</div>
          </div>
          <div className="dash-stat">
            <div className="ic"><Download size={20} /></div>
            <div className="n">{totalDownloads}</div>
            <div className="l">Total Downloads</div>
          </div>
          <div className="dash-stat">
            <div className="ic"><IndianRupee size={20} /></div>
            <div className="n">₹{totalSpent.toLocaleString("en-IN")}</div>
            <div className="l">Total Spent</div>
          </div>
          <div className="dash-stat">
            <div className="ic"><BookOpen size={20} /></div>
            <div className="n">{approved}</div>
            <div className="l">Approved Orders</div>
          </div>
        </div>

        <div className="dash-panel">
          <div className="ph">
            <h2>{tab === "orders" ? "My Orders" : tab === "wishlist" ? "Wishlist" : "Account Settings"}</h2>
            {tab === "orders" && (
              <input className="dash-search" placeholder="Search orders..." value={q} onChange={(e) => setQ(e.target.value)} />
            )}
          </div>

          {tab === "orders" &&
            (filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--muted)" }}>
                <BookOpen size={42} style={{ color: "var(--line)", marginBottom: 10 }} />
                <p style={{ marginBottom: 16 }}>You haven't placed any orders yet.</p>
                <Link href="/shop" className="btn btn-primary">Browse Courses</Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => {
                      const date = new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                      const isApproved = order.status === "approved";
                      const isPending = order.status === "pending";
                      const items = (order.items || []) as { name: string; price: number; img: string; qty: number; downloadUrl?: string | null }[];
                      return (
                        <tr key={order.orderId}>
                          <td><strong>{order.orderId}</strong></td>
                          <td>{items.map((i) => i.name).join(", ")}</td>
                          <td><strong>₹{order.total}</strong></td>
                          <td>{date}</td>
                          <td>
                            <span className={`badge ${isApproved ? "approved" : isPending ? "pending" : "rejected"}`}>
                              {isApproved ? "Approved" : isPending ? "Pending Verification" : "Rejected"}
                            </span>
                          </td>
                          <td>
                            {isApproved ? (
                              items.map((i) =>
                                i.downloadUrl && i.downloadUrl !== "#" ? (
                                  <a key={i.name} href={i.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-accent btn-sm" style={{ margin: "2px 4px 2px 0" }}>
                                    <DownloadCloud size={13} /> Download
                                  </a>
                                ) : (
                                  <span key={i.name} style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, marginRight: 8 }}>
                                    <BookOpen size={12} /> Course access unlocked
                                  </span>
                                )
                              )
                            ) : isPending ? (
                              <span style={{ color: "#b57f0a", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <Clock size={13} /> Verify ho raha hai
                              </span>
                            ) : (
                              <span style={{ color: "#c0392b", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <XCircle size={13} /> Payment rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}

          {tab === "settings" && (
            <div>
              <p style={{ fontSize: 14.5, color: "var(--body)", marginBottom: 18 }}>
                Your account details below. For password changes or support, contact us on WhatsApp.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div className="dash-stat" style={{ minWidth: 220 }}>
                  <div className="l" style={{ marginBottom: 6 }}>Name</div>
                  <div className="n" style={{ fontSize: 18 }}>{user.name}</div>
                </div>
                <div className="dash-stat" style={{ minWidth: 220 }}>
                  <div className="l" style={{ marginBottom: 6 }}>Email</div>
                  <div className="n" style={{ fontSize: 18 }}>{user.email}</div>
                </div>
              </div>
              <a href={`https://wa.me/919759131256`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: 18 }}>
                <ChevronRight size={16} /> Contact Support on WhatsApp
              </a>
              <button className="btn btn-outline" style={{ marginTop: 18, marginLeft: 10 }} onClick={() => logout()}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}