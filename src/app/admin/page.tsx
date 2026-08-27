"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingCart, CheckCircle, Clock, XCircle,
  IndianRupee, Search, RefreshCw, LogOut, Eye, Check, X,
  TrendingUp, Package, ChevronRight, Send
} from "lucide-react";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

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

  const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;

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
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await supabase.from("orders").select("*").order("date", { ascending: false });
      if (data) {
        const formatted = data.map(o => ({ ...o, items: typeof o.items === "string" ? JSON.parse(o.items) : o.items })) as Order[];
        setOrders(formatted);
        setFilteredOrders(formatted);
        calculateStats(formatted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Database error");
    }
    setLoading(false);
  }, [supabase, calculateStats]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    let result = orders;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(o => o.order_id.toLowerCase().includes(s) || o.name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s) || (o.utr && o.utr.toLowerCase().includes(s)));
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
      const updatedItems = items.map((item: OrderItem) => ({
        ...item,
        downloadUrl: downloadInputs[item.id || item.name] || item.downloadUrl || `https://www.edubaazar.shop/account`
      }));

      await supabase.from("orders").update({ status: "approved", items: JSON.stringify(updatedItems) }).eq("order_id", orderId);

      await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, name: order.name, email: order.email, status: "approved", items: updatedItems }),
      });

      await fetchOrders();
    } catch (err) {
      console.error("Approve error:", err);
    }
    setProcessing(null);
  };

  const handleReject = async (orderId: string) => {
    if (!supabase) return;
    setProcessing(orderId);
    try {
      const order = orders.find(o => o.order_id === orderId);
      if (!order) return;
      await supabase.from("orders").update({ status: "rejected" }).eq("order_id", orderId);
      await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, name: order.name, email: order.email, status: "rejected", items: [] }),
      });
      await fetchOrders();
    } catch (err) {
      console.error("Reject error:", err);
    }
    setProcessing(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const parseItems = (o: Order): OrderItem[] => Array.isArray(o.items) ? o.items : JSON.parse(o.items as string);

  return (
    <div className="admin-layout">
      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .admin-layout { display: flex; min-height: 100vh; background: #f5f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .sidebar { width: 260px; background: #1a1a2e; color: white; position: fixed; height: 100vh; overflow-y: auto; z-index: 10; }
        .sidebar-brand { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar-brand h2 { font-size: 22px; font-weight: 700; margin: 0; }
        .sidebar-brand p { font-size: 11px; color: rgba(255,255,255,0.5); margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px; }
        .sidebar-nav { padding: 16px 0; }
        .sidebar-nav a { display: flex; align-items: center; gap: 12px; padding: 12px 24px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: all 0.15s; }
        .sidebar-nav a:hover, .sidebar-nav a.active { background: rgba(255,255,255,0.08); color: white; }
        .sidebar-footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); }
        .sidebar-footer a { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.5); text-decoration: none; font-size: 13px; padding: 8px 0; }
        .sidebar-footer a:hover { color: white; }
        .main { flex: 1; margin-left: 260px; padding: 32px; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .top-bar h1 { font-size: 26px; font-weight: 700; color: #181d27; margin: 0; }
        .refresh-btn { padding: 10px 18px; background: #1a1a2e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .refresh-btn:hover { background: #2a2a4e; }
        .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 14px; }
        .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-icon svg { width: 22px; height: 22px; }
        .stat-card h3 { font-size: 24px; font-weight: 700; margin: 0; color: #181d27; }
        .stat-card p { font-size: 12px; color: #666; margin: 2px 0 0; }
        .sc1 .stat-icon { background: #e3f2fd; color: #1976d2; }
        .sc2 .stat-icon { background: #fff3e0; color: #f57c00; }
        .sc3 .stat-icon { background: #e8f5e9; color: #388e3c; }
        .sc4 .stat-icon { background: #ffebee; color: #d32f2f; }
        .sc5 .stat-icon { background: #f3e5f5; color: #7b1fa2; }
        .sc6 .stat-icon { background: #e0f7fa; color: #0097a7; }
        .toolbar { background: white; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .search-wrap { flex: 1; min-width: 220px; position: relative; }
        .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; }
        .search-wrap input { width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 13px; outline: none; }
        .search-wrap input:focus { border-color: #687975; }
        .filter-sel { padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 13px; outline: none; cursor: pointer; background: white; }
        .table-wrap { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .table-head { display: grid; grid-template-columns: 140px 1.5fr 1fr 120px 100px 110px 140px; padding: 12px 20px; background: #fafafa; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-row { display: grid; grid-template-columns: 140px 1.5fr 1fr 120px 100px 110px 140px; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; align-items: center; font-size: 13px; transition: background 0.1s; }
        .table-row:hover { background: #f9fafb; }
        .oid { font-family: monospace; font-weight: 600; color: #687975; font-size: 12px; }
        .cust strong { display: block; color: #181d27; }
        .cust span { font-size: 11px; color: #888; }
        .total { font-weight: 700; }
        .date { color: #666; font-size: 12px; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-pending { background: #fff3cd; color: #856404; }
        .badge-approved { background: #d4edda; color: #155724; }
        .badge-rejected { background: #f8d7da; color: #721c24; }
        .actions { display: flex; gap: 6px; }
        .btn-sm { padding: 6px 10px; border: none; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        .btn-view { background: #e3f2fd; color: #1976d2; }
        .btn-ok { background: #e8f5e9; color: #2e7d32; }
        .btn-no { background: #ffebee; color: #c62828; }
        .btn-view:hover { background: #1976d2; color: white; }
        .btn-ok:hover { background: #2e7d32; color: white; }
        .btn-no:hover { background: #c62828; color: white; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty { text-align: center; padding: 60px; color: #888; }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal { background: white; border-radius: 14px; width: 92%; max-width: 640px; max-height: 88vh; overflow-y: auto; }
        .modal-top { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .modal-top h2 { margin: 0; font-size: 18px; }
        .modal-close { background: none; border: none; cursor: pointer; color: #666; padding: 6px; border-radius: 6px; }
        .modal-close:hover { background: #f0f0f0; }
        .modal-body { padding: 24px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .detail-item { display: flex; flex-direction: column; gap: 2px; }
        .detail-item label { font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600; }
        .detail-item span { font-size: 14px; font-weight: 600; color: #181d27; }
        .items-section { margin-top: 20px; }
        .items-section h3 { font-size: 14px; margin: 0 0 12px; color: #181d27; }
        .item-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; }
        .item-card strong { font-size: 14px; }
        .item-card .price { color: #687975; font-weight: 700; }
        .dl-section { margin-top: 20px; padding: 16px; background: #f0f7f4; border-radius: 8px; border: 1px solid #c3e6cb; }
        .dl-section h4 { font-size: 13px; margin: 0 0 10px; color: #155724; }
        .dl-input { width: 100%; padding: 10px 12px; border: 1.5px solid #c3e6cb; border-radius: 6px; font-size: 13px; outline: none; margin-top: 6px; }
        .dl-input:focus { border-color: #687975; }
        .dl-label { font-size: 12px; font-weight: 600; color: #181d27; }
        .modal-foot { padding: 16px 24px; border-top: 1px solid #eee; display: flex; gap: 10px; justify-content: flex-end; }
        .btn-main { padding: 10px 20px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .btn-green { background: #28a745; color: white; }
        .btn-red { background: #dc3545; color: white; }
        .btn-gray { background: #f0f0f0; color: #333; }
        .btn-green:hover { background: #218838; }
        .btn-red:hover { background: #c82333; }
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } .table-head, .table-row { grid-template-columns: 100px 1fr 80px 90px 120px; } .table-head > :nth-child(4), .table-head > :nth-child(5), .table-row > :nth-child(4), .table-row > :nth-child(5) { display: none; } }
        @media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr 1fr; } .main { padding: 16px; } .sidebar { display: none; } .main { margin-left: 0; } }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>EduBazar</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          <a href="/admin" className="active"><LayoutDashboard size={18} /> Dashboard</a>
          <a href="/"><ShoppingCart size={18} /> View Store</a>
          <a href="/admin/seo"><TrendingUp size={18} /> SEO Tools</a>
        </nav>
        <div className="sidebar-footer">
          <a href="/api/admin/logout"><LogOut size={16} /> Logout</a>
        </div>
      </aside>

      <main className="main">
        <div className="top-bar">
          <h1>Dashboard</h1>
          <button className="refresh-btn" onClick={fetchOrders}><RefreshCw size={15} /> Refresh</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card sc1"><div className="stat-icon"><Package size={22} /></div><div><h3>{stats.totalOrders}</h3><p>Total Orders</p></div></div>
          <div className="stat-card sc2"><div className="stat-icon"><Clock size={22} /></div><div><h3>{stats.pendingOrders}</h3><p>Pending</p></div></div>
          <div className="stat-card sc3"><div className="stat-icon"><CheckCircle size={22} /></div><div><h3>{stats.approvedOrders}</h3><p>Approved</p></div></div>
          <div className="stat-card sc4"><div className="stat-icon"><XCircle size={22} /></div><div><h3>{stats.rejectedOrders}</h3><p>Rejected</p></div></div>
          <div className="stat-card sc5"><div className="stat-icon"><IndianRupee size={22} /></div><div><h3>₹{stats.totalRevenue.toLocaleString()}</h3><p>Revenue</p></div></div>
          <div className="stat-card sc6"><div className="stat-icon"><TrendingUp size={22} /></div><div><h3>{stats.todayOrders}</h3><p>Today</p></div></div>
        </div>

        <div className="toolbar">
          <div className="search-wrap"><Search size={16} /><input placeholder="Search order, name, email, UTR..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="filter-sel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error ? (
          <div style={{ background: "#fff", borderRadius: 10, padding: 40, textAlign: "center" }}>
            <p style={{ color: "#c62828", marginBottom: 16 }}>{error}</p>
            <button className="refresh-btn" onClick={fetchOrders}>Retry</button>
          </div>
        ) : loading ? (
          <div style={{ background: "white", borderRadius: 10, padding: 60, textAlign: "center" }}><RefreshCw size={32} style={{ color: "#687975", animation: "spin 1s linear infinite" }} /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="table-wrap"><div className="empty"><ShoppingCart size={48} style={{ marginBottom: 12, color: "#ccc" }} /><p>No orders found</p></div></div>
        ) : (
          <div className="table-wrap">
            <div className="table-head">
              <div>Order ID</div><div>Customer</div><div>Total</div><div>Date</div><div>Status</div><div>UTR</div><div>Actions</div>
            </div>
            {filteredOrders.map(o => (
              <div className="table-row" key={o.order_id}>
                <div className="oid">#{o.order_id}</div>
                <div className="cust"><strong>{o.name}</strong><span>{o.email}</span></div>
                <div className="total">₹{o.total.toLocaleString()}</div>
                <div className="date">{formatDate(o.date)}</div>
                <div><span className={`badge badge-${o.status}`}>{o.status}</span></div>
                <div style={{ fontSize: 12, fontFamily: "monospace" }}>{o.utr || "—"}</div>
                <div className="actions">
                  <button className="btn-sm btn-view" onClick={() => { setSelectedOrder(o); setShowModal(true); }}><Eye size={12} /> View</button>
                  {o.status === "pending" && <>
                    <button className="btn-sm btn-ok" onClick={() => { setSelectedOrder(o); setShowModal(true); }} disabled={processing === o.order_id}><Check size={12} /> Approve</button>
                    <button className="btn-sm btn-no" onClick={() => handleReject(o.order_id)} disabled={processing === o.order_id}><X size={12} /></button>
                  </>}
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
                <h3>Items</h3>
                {parseItems(selectedOrder).map((item, i) => (
                  <div className="item-card" key={i}>
                    <strong>{item.name}</strong>
                    <span className="price">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {selectedOrder.status === "pending" && (
                <div className="dl-section">
                  <h4>Download Links (dene ke baad approve karein)</h4>
                  {parseItems(selectedOrder).map((item, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div className="dl-label">{item.name}</div>
                      <input
                        className="dl-input"
                        placeholder="https://drive.google.com/file/d/... ya koi bhi link"
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
                      {item.downloadUrl ? <a href={item.downloadUrl} target="_blank" rel="noreferrer" className="btn-sm btn-ok"><ChevronRight size={12} /> Open Link</a> : <span style={{ color: "#999", fontSize: 12 }}>No link</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedOrder.status === "pending" && (
              <div className="modal-foot">
                <button className="btn-main btn-gray" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-main btn-red" onClick={() => { handleReject(selectedOrder.order_id); setShowModal(false); }} disabled={processing === selectedOrder.order_id}><X size={14} /> Reject</button>
                <button className="btn-main btn-green" onClick={() => { handleApprove(selectedOrder.order_id); setShowModal(false); }} disabled={processing === selectedOrder.order_id}><Send size={14} /> Approve & Send</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
