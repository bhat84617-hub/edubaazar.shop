"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingCart, CheckCircle, Clock, XCircle,
  IndianRupee, Search, RefreshCw, LogOut, Eye, Check, X,
  TrendingUp, Package, ChevronRight, Send, AlertCircle
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/store";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  downloadUrl?: string;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  totalRevenue: number;
  todayOrders: number;
}

export default function AdminDashboard() {
  const { allOrders, updateOrderStatus, adminLogout } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [downloadInputs, setDownloadInputs] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, pendingOrders: 0, approvedOrders: 0, rejectedOrders: 0, totalRevenue: 0, todayOrders: 0 });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const calculateStats = useCallback((data: Order[]) => {
    const today = new Date().toDateString();
    setStats({
      totalOrders: data.length,
      pendingOrders: data.filter(o => o.status === "pending").length,
      approvedOrders: data.filter(o => o.status === "approved").length,
      rejectedOrders: data.filter(o => o.status === "rejected").length,
      totalRevenue: data.filter(o => o.status === "approved").reduce((s, o) => s + o.total, 0),
      todayOrders: data.filter(o => new Date(o.date).toDateString() === today).length,
    });
  }, []);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    try {
      const all = allOrders;
      setOrders(all);
      setFilteredOrders(all);
      calculateStats(all);
    } catch {
      setOrders([]);
      setFilteredOrders([]);
      calculateStats([]);
    }
    setLoading(false);
  }, [allOrders, calculateStats]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    let result = orders;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(o =>
        o.orderId.toLowerCase().includes(s) ||
        o.name.toLowerCase().includes(s) ||
        o.email.toLowerCase().includes(s) ||
        (o.utr && o.utr.toLowerCase().includes(s))
      );
    }
    if (statusFilter !== "all") result = result.filter(o => o.status === statusFilter);
    setFilteredOrders(result);
  }, [orders, search, statusFilter]);

  const handleApprove = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return;

      const missingLinks = order.items.filter(item => !downloadInputs[item.id] && !item.downloadUrl);
      if (missingLinks.length > 0) {
        showToast(`Please enter download links for all items (${missingLinks.length} missing)`, "error");
        setProcessing(null);
        return;
      }

      const downloadUrls: Record<string, string> = {};
      order.items.forEach(item => {
        downloadUrls[item.id] = downloadInputs[item.id] || item.downloadUrl || "";
      });

      await updateOrderStatus(orderId, "approved", downloadUrls);

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order-status",
          orderId,
          name: order.name,
          email: order.email,
          status: "approved",
          downloadUrls,
        }),
      }).catch(() => {});

      showToast("Order approved! User will receive download links.");
      fetchOrders();
      setShowModal(false);
    } catch {
      showToast("Failed to approve order", "error");
    }
    setProcessing(null);
  };

  const handleReject = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return;

      await updateOrderStatus(orderId, "rejected");

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order-status",
          orderId,
          name: order.name,
          email: order.email,
          status: "rejected",
          downloadUrls: {},
        }),
      }).catch(() => {});

      showToast("Order rejected. User will be notified.");
      fetchOrders();
      setShowModal(false);
    } catch {
      showToast("Failed to reject order", "error");
    }
    setProcessing(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setDownloadInputs({});
  };

  return (
    <div className="admin-shell">
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000, padding: "14px 24px", borderRadius: 8,
          background: toast.type === "success" ? "#28a745" : "#dc3545", color: "#fff", fontSize: 14, fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          {toast.msg}
        </div>
      )}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>EduBazar</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="admin-sidebar-nav">
          <a href="/admin" className="active"><LayoutDashboard size={18} /> Dashboard</a>
          <a href="/"><ShoppingCart size={18} /> View Store</a>
        </nav>
        <div className="admin-sidebar-footer">
          <a onClick={adminLogout} style={{ cursor: "pointer" }}><LogOut size={16} /> Logout</a>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-top-bar">
          <h1>Payment Verification Dashboard</h1>
          <button className="btn btn-primary btn-sm" onClick={fetchOrders}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card sc1"><div className="stat-icon"><Package size={22} /></div><div><h3>{stats.totalOrders}</h3><p>Total Orders</p></div></div>
          <div className="admin-stat-card sc2"><div className="stat-icon"><Clock size={22} /></div><div><h3>{stats.pendingOrders}</h3><p>Pending</p></div></div>
          <div className="admin-stat-card sc3"><div className="stat-icon"><CheckCircle size={22} /></div><div><h3>{stats.approvedOrders}</h3><p>Approved</p></div></div>
          <div className="admin-stat-card sc4"><div className="stat-icon"><XCircle size={22} /></div><div><h3>{stats.rejectedOrders}</h3><p>Rejected</p></div></div>
          <div className="admin-stat-card sc5"><div className="stat-icon"><IndianRupee size={22} /></div><div><h3>₹{stats.totalRevenue.toLocaleString()}</h3><p>Revenue</p></div></div>
          <div className="admin-stat-card sc6"><div className="stat-icon"><TrendingUp size={22} /></div><div><h3>{stats.todayOrders}</h3><p>Today</p></div></div>
        </div>

        <div className="admin-toolbar">
          <div className="search-wrap">
            <Search size={16} />
            <input
              placeholder="Search order, name, email, UTR..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-sel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-empty">
            <RefreshCw size={32} className="spin" />
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <ShoppingCart size={48} style={{ marginBottom: 12, color: "#ccc" }} />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <div className="admin-table-head">
              <div>Order ID</div><div>Customer</div><div>Total</div><div>Date</div><div>Status</div><div>UTR</div><div>Actions</div>
            </div>
            {filteredOrders.map(o => (
              <div className="admin-table-row" key={o.orderId}>
                <div className="oid">#{o.orderId}</div>
                <div className="cust"><strong>{o.name}</strong><span>{o.email}</span></div>
                <div className="total">₹{o.total.toLocaleString()}</div>
                <div className="date">{formatDate(o.date)}</div>
                <div><span className={`badge badge-${o.status}`}>{o.status}</span></div>
                <div className="utr">{o.utr || "—"}</div>
                <div className="actions">
                  <button className="btn-sm btn-view" onClick={() => openModal(o)}>
                    <Eye size={12} /> View
                  </button>
                  {o.status === "pending" && (
                    <>
                      <button className="btn-sm btn-ok" onClick={() => openModal(o)} disabled={processing === o.orderId}>
                        <Check size={12} /> Approve
                      </button>
                      <button className="btn-sm btn-no" onClick={() => handleReject(o.orderId)} disabled={processing === o.orderId}>
                        <X size={12} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && selectedOrder && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Order #{selectedOrder.orderId}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
                <div className="detail-item"><label>Date</label><span>{formatDate(selectedOrder.date)}</span></div>
                <div className="detail-item"><label>Customer</label><span>{selectedOrder.name}</span></div>
                <div className="detail-item"><label>Email</label><span>{selectedOrder.email}</span></div>
                <div className="detail-item"><label>Total</label><span>₹{selectedOrder.total.toLocaleString()}</span></div>
                <div className="detail-item"><label>UTR</label><span>{selectedOrder.utr || "Not provided"}</span></div>
              </div>

              <div className="items-section">
                <h3>Items to Deliver</h3>
                {selectedOrder.items.map((item, i) => (
                  <div className="item-card" key={i}>
                    <strong>{item.name}</strong>
                    <span className="price">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {selectedOrder.status === "pending" && (
                <div className="dl-section">
                  <h4>Download Links (enter links then approve)</h4>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div className="dl-label">{item.name}</div>
                      <input
                        className="dl-input"
                        placeholder="https://drive.google.com/file/d/... or any link"
                        value={downloadInputs[item.id] || item.downloadUrl || ""}
                        onChange={e => setDownloadInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedOrder.status === "approved" && (
                <div className="items-section">
                  <h3>Approved Download Links</h3>
                  {selectedOrder.items.map((item, i) => (
                    <div className="item-card" key={i}>
                      <span>{item.name}</span>
                      {item.downloadUrl ? (
                        <a href={item.downloadUrl} target="_blank" rel="noreferrer" className="btn-sm btn-ok">
                          <ChevronRight size={12} /> Open Link
                        </a>
                      ) : (
                        <span style={{ color: "#999", fontSize: 12 }}>No link</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedOrder.status === "pending" && (
              <div className="modal-foot">
                <button className="btn-main btn-gray" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-main btn-red" onClick={() => handleReject(selectedOrder.orderId)} disabled={processing === selectedOrder.orderId}>
                  <X size={14} /> Reject Order
                </button>
                <button className="btn-main btn-green" onClick={() => handleApprove(selectedOrder.orderId)} disabled={processing === selectedOrder.orderId}>
                  <Send size={14} /> Approve & Send Links
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
