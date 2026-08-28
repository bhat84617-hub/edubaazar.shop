"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingCart, CheckCircle, Clock, XCircle,
  IndianRupee, Search, RefreshCw, LogOut, Eye, Check, X,
  TrendingUp, Package, ChevronRight, Send, AlertCircle
} from "lucide-react";

const SUPABASE_URL = "https://zzkjeimlnawgrkuwbban.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2plaW1sbmF3Z3JrdXdiYmFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzg5MzkwOCwiZXhwIjoyMTAzNDY5OTA4fQ.fdZwR_6gi2rjOTN2EIMlu12n49H-99h2x0Dh_t5Goic";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  downloadUrl?: string;
}

interface Order {
  order_id: string;
  name: string;
  email: string;
  phone?: string;
  items: string | OrderItem[];
  total: number;
  utr: string | null;
  status: string;
  date: string;
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
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [debug, setDebug] = useState<string>("");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "public" }
  });

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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebug("Connecting to Supabase...");
    try {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("date", { ascending: false });

      if (fetchError) {
        setDebug(`Error: ${fetchError.message}`);
        setError(`Database error: ${fetchError.message}`);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setDebug(`Found ${data.length} orders`);
        const formatted = data.map(o => ({
          ...o,
          items: typeof o.items === "string" ? JSON.parse(o.items) : o.items
        })) as Order[];
        setOrders(formatted);
        setFilteredOrders(formatted);
        calculateStats(formatted);
      } else {
        setDebug("No orders found in database");
        setOrders([]);
        setFilteredOrders([]);
        calculateStats([]);
      }
    } catch (err) {
      setDebug(`Exception: ${err instanceof Error ? err.message : "Unknown error"}`);
      setError(err instanceof Error ? err.message : "Database error");
    }
    setLoading(false);
  }, [supabase, calculateStats]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    let result = orders;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(o =>
        o.order_id.toLowerCase().includes(s) ||
        o.name.toLowerCase().includes(s) ||
        o.email.toLowerCase().includes(s) ||
        (o.utr && o.utr.toLowerCase().includes(s))
      );
    }
    if (statusFilter !== "all") result = result.filter(o => o.status === statusFilter);
    setFilteredOrders(result);
  }, [orders, search, statusFilter]);

  const handleApprove = async (orderId: string) => {
    if (!supabase) return;
    setProcessing(orderId);
    try {
      const order = orders.find(o => o.order_id === orderId);
      if (!order) return;

      const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items as string);

      const missingLinks = items.filter((item: OrderItem) => !downloadInputs[item.id || item.name] && !item.downloadUrl);
      if (missingLinks.length > 0) {
        showToast(`Please enter download links for all items (${missingLinks.length} missing)`, "error");
        setProcessing(null);
        return;
      }

      const updatedItems = items.map((item: OrderItem) => ({
        ...item,
        downloadUrl: downloadInputs[item.id || item.name] || item.downloadUrl || ""
      }));

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "approved", items: JSON.stringify(updatedItems) })
        .eq("order_id", orderId);

      if (updateError) throw updateError;

      await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, name: order.name, email: order.email, status: "approved", items: updatedItems }),
      });

      showToast("Order approved! User will receive download links.");
      await fetchOrders();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to approve order", "error");
    }
    setProcessing(null);
  };

  const handleReject = async (orderId: string) => {
    if (!supabase) return;
    setProcessing(orderId);
    try {
      const order = orders.find(o => o.order_id === orderId);
      if (!order) return;

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "rejected" })
        .eq("order_id", orderId);

      if (updateError) throw updateError;

      await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, name: order.name, email: order.email, status: "rejected", items: [] }),
      });

      showToast("Order rejected. User will be notified.");
      await fetchOrders();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to reject order", "error");
    }
    setProcessing(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const parseItems = (o: Order): OrderItem[] => Array.isArray(o.items) ? o.items : JSON.parse(o.items as string);

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
          <a href="/admin/seo"><TrendingUp size={18} /> SEO Tools</a>
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/api/admin/logout"><LogOut size={16} /> Logout</a>
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

        {error && (
          <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#dc2626", fontSize: 13, marginBottom: 16, borderRadius: 8, border: "1px solid #fecaca" }}>
            {error}
            {debug && <div style={{ marginTop: 4, fontSize: 11, color: "#666" }}>Debug: {debug}</div>}
          </div>
        )}

        {loading ? (
          <div className="admin-empty">
            <RefreshCw size={32} className="spin" />
            <p>Loading orders...</p>
            {debug && <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>{debug}</p>}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <ShoppingCart size={48} style={{ marginBottom: 12, color: "#ccc" }} />
            <p>No orders found</p>
            {debug && <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>{debug}</p>}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <div className="admin-table-head">
              <div>Order ID</div><div>Customer</div><div>Total</div><div>Date</div><div>Status</div><div>UTR</div><div>Actions</div>
            </div>
            {filteredOrders.map(o => (
              <div className="admin-table-row" key={o.order_id}>
                <div className="oid">#{o.order_id}</div>
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
                      <button className="btn-sm btn-ok" onClick={() => openModal(o)} disabled={processing === o.order_id}>
                        <Check size={12} /> Approve
                      </button>
                      <button className="btn-sm btn-no" onClick={() => handleReject(o.order_id)} disabled={processing === o.order_id}>
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
              <h2>Order #{selectedOrder.order_id}</h2>
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
                {parseItems(selectedOrder).map((item, i) => (
                  <div className="item-card" key={i}>
                    <strong>{item.name}</strong>
                    <span className="price">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {selectedOrder.status === "pending" && (
                <div className="dl-section">
                  <h4>Download Links (enter links then approve)</h4>
                  {parseItems(selectedOrder).map((item, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div className="dl-label">{item.name}</div>
                      <input
                        className="dl-input"
                        placeholder="https://drive.google.com/file/d/... or any link"
                        value={downloadInputs[item.id || item.name] || item.downloadUrl || ""}
                        onChange={e => setDownloadInputs(prev => ({ ...prev, [item.id || item.name]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedOrder.status === "approved" && (
                <div className="items-section">
                  <h3>Approved Download Links</h3>
                  {parseItems(selectedOrder).map((item, i) => (
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
                <button className="btn-main btn-red" onClick={() => handleReject(selectedOrder.order_id)} disabled={processing === selectedOrder.order_id}>
                  <X size={14} /> Reject Order
                </button>
                <button className="btn-main btn-green" onClick={() => handleApprove(selectedOrder.order_id)} disabled={processing === selectedOrder.order_id}>
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
