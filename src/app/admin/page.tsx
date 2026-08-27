"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  XCircle, 
  IndianRupee, 
  Search,
  RefreshCw,
  LogOut,
  Eye,
  Check,
  X,
  TrendingUp,
  Package
} from "lucide-react";

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
  items: string | OrderItem[];
  total: number;
  utr: string | null;
  status: string;
  date: string;
  phone?: string;
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
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    totalRevenue: 0,
    todayOrders: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [envCheck, setEnvCheck] = useState<string>("Checking...");

  useEffect(() => {
    setEnvCheck(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗"}, SUPABASE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"}, ADMIN_PWD: ${process.env.ADMIN_PASSWORD ? "✓" : "✗"}`);
  }, []);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  console.log("Environment check:", { 
    supabaseUrl: supabaseUrl ? "SET" : "MISSING",
    supabaseKey: supabaseKey ? "SET" : "MISSING",
    adminPassword: adminPassword ? "SET" : "MISSING"
  });

  const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;

  const calculateStats = useCallback((ordersData: Order[]) => {
    const today = new Date().toDateString();
    const todayOrders = ordersData.filter(o => new Date(o.date).toDateString() === today);
    
    setStats({
      totalOrders: ordersData.length,
      pendingOrders: ordersData.filter(o => o.status === "pending").length,
      approvedOrders: ordersData.filter(o => o.status === "approved").length,
      rejectedOrders: ordersData.filter(o => o.status === "rejected").length,
      totalRevenue: ordersData.filter(o => o.status === "approved").reduce((sum, o) => sum + o.total, 0),
      todayOrders: todayOrders.length
    });
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("date", { ascending: false });

      if (data) {
        const formatted = data.map(o => ({
          ...o,
          items: typeof o.items === "string" ? JSON.parse(o.items) : o.items
        })) as Order[];
        
        setOrders(formatted);
        setFilteredOrders(formatted);
        calculateStats(formatted);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to database");
    }
    setLoading(false);
  }, [supabase, calculateStats]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const filtered = orders.filter(o => {
      // Search filter
      if (search) {
        const s = search.toLowerCase();
        if (
          !o.order_id.toLowerCase().includes(s) &&
          !o.name.toLowerCase().includes(s) &&
          !o.email.toLowerCase().includes(s) &&
          !(o.utr && o.utr.toLowerCase().includes(s))
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && o.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== "all") {
        const orderDate = new Date(o.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateFilter === "today") {
          if (orderDate < today) return false;
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < monthAgo) return false;
        }
      }

      return true;
    });

    setFilteredOrders(filtered);
  }, [orders, search, statusFilter, dateFilter]);

  const handleApprove = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const order = orders.find(o => o.order_id === orderId);
      if (!order || !supabase) return;

      const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items);
      const updatedItems = items.map((item: OrderItem) => ({
        ...item,
        downloadUrl: item.downloadUrl || `https://www.edubaazar.shop/account`
      }));

      await supabase
        .from("orders")
        .update({ status: "approved", items: JSON.stringify(updatedItems) })
        .eq("order_id", orderId);

      // Send email notification
      await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          name: order.name,
          email: order.email,
          status: "approved",
          items: updatedItems
        })
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error approving order:", error);
    }
    setProcessing(null);
  };

  const handleReject = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const order = orders.find(o => o.order_id === orderId);
      if (!order || !supabase) return;

      await supabase
        .from("orders")
        .update({ status: "rejected" })
        .eq("order_id", orderId);

      // Send email notification
      await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          name: order.name,
          email: order.email,
          status: "rejected",
          items: []
        })
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
    setProcessing(null);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "var(--success)";
      case "pending": return "var(--warning)";
      case "rejected": return "var(--danger)";
      default: return "var(--muted)";
    }
  };

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "var(--bg)",
        padding: "20px",
        textAlign: "center"
      }}>
        <div style={{ 
          background: "#ffebee", 
          border: "1px solid #ffcdd2",
          borderRadius: "12px", 
          padding: "32px",
          maxWidth: "500px"
        }}>
          <h2 style={{ color: "#c62828", marginBottom: "16px" }}>Admin Panel Error</h2>
          <p style={{ color: "#b71c1c", marginBottom: "24px" }}>{error}</p>
          <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", textAlign: "left", fontSize: "14px", marginBottom: "24px" }}>
            <strong>Required Environment Variables:</strong>
            <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>SUPABASE_SERVICE_ROLE_KEY</li>
              <li>ADMIN_PASSWORD</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: "#181d27",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "var(--bg)"
      }}>
        <RefreshCw className="spin" size={32} style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }
        .admin-sidebar {
          width: 260px;
          background: #1a1a2e;
          color: white;
          padding: 24px 0;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }
        .sidebar-brand {
          padding: 0 24px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 24px;
        }
        .sidebar-brand h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: white;
        }
        .sidebar-brand p {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin: 4px 0 0;
        }
        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar-menu li a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: all 0.2s;
          font-size: 14px;
        }
        .sidebar-menu li a:hover,
        .sidebar-menu li a.active {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .sidebar-menu li a svg {
          width: 18px;
          height: 18px;
        }
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 32px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .admin-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon svg {
          width: 24px;
          height: 24px;
        }
        .stat-content h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: var(--text);
        }
        .stat-content p {
          font-size: 13px;
          color: var(--muted);
          margin: 4px 0 0;
        }
        .stat-card:nth-child(1) .stat-icon { background: #e3f2fd; color: #1976d2; }
        .stat-card:nth-child(2) .stat-icon { background: #fff3e0; color: #f57c00; }
        .stat-card:nth-child(3) .stat-icon { background: #e8f5e9; color: #388e3c; }
        .stat-card:nth-child(4) .stat-icon { background: #ffebee; color: #d32f2f; }
        .stat-card:nth-child(5) .stat-icon { background: #f3e5f5; color: #7b1fa2; }
        .stat-card:nth-child(6) .stat-icon { background: #e0f7fa; color: #0097a7; }
        
        .filter-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
        }
        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }
        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-box input:focus {
          border-color: var(--primary);
        }
        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          min-width: 150px;
        }
        .filter-select:focus {
          border-color: var(--primary);
        }
        .refresh-btn {
          padding: 12px 20px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .refresh-btn:hover {
          background: #1a1a2e;
        }
        
        .orders-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr 1fr 1fr;
          padding: 16px 24px;
          background: #f8f9fa;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .order-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr 1fr 1fr;
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
          font-size: 14px;
          transition: background 0.2s;
        }
        .order-row:hover {
          background: #f8f9fa;
        }
        .order-row:last-child {
          border-bottom: none;
        }
        .order-id {
          font-family: monospace;
          font-weight: 600;
          color: var(--primary);
        }
        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .customer-name {
          font-weight: 600;
          color: var(--text);
        }
        .customer-email {
          font-size: 12px;
          color: var(--muted);
        }
        .order-total {
          font-weight: 700;
          color: var(--text);
        }
        .order-date {
          color: var(--muted);
          font-size: 13px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-approved {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .status-pending {
          background: #fff3e0;
          color: #e65100;
        }
        .status-rejected {
          background: #ffebee;
          color: #c62828;
        }
        .action-btns {
          display: flex;
          gap: 8px;
        }
        .btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .btn-view {
          background: #e3f2fd;
          color: #1976d2;
        }
        .btn-view:hover {
          background: #1976d2;
          color: white;
        }
        .btn-approve {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .btn-approve:hover {
          background: #2e7d32;
          color: white;
        }
        .btn-reject {
          background: #ffebee;
          color: #c62828;
        }
        .btn-reject:hover {
          background: #c62828;
          color: white;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: var(--text);
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: #f0f0f0;
          color: var(--text);
        }
        .modal-body {
          padding: 24px;
        }
        .detail-section {
          margin-bottom: 24px;
        }
        .detail-section h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          margin: 0 0 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: var(--muted);
          font-size: 14px;
        }
        .detail-value {
          font-weight: 600;
          color: var(--text);
          font-size: 14px;
        }
        .items-list {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .item-row:last-child {
          border-bottom: none;
        }
        .item-name {
          font-weight: 600;
          color: var(--text);
        }
        .item-price {
          font-weight: 700;
          color: var(--primary);
        }
        .modal-footer {
          padding: 24px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          background: #1a1a2e;
        }
        .btn-secondary {
          background: #f0f0f0;
          color: var(--text);
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: #e0e0e0;
        }
        .btn-success {
          background: #2e7d32;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-success:hover {
          background: #1b5e20;
        }
        .btn-danger {
          background: #c62828;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-danger:hover {
          background: #b71c1c;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }
        .empty-state svg {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          color: var(--line);
        }
        .logout-btn {
          position: fixed;
          bottom: 24px;
          left: 24px;
          padding: 12px 24px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .no-orders {
          grid-column: 1 / -1;
        }
      `}</style>

      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>EduBazar</h2>
          <p>Admin Panel</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link href="/admin" className="active">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/">
              <ShoppingCart size={18} />
              View Store
            </Link>
          </li>
          <li>
            <Link href="/admin/seo">
              <TrendingUp size={18} />
              SEO Settings
            </Link>
          </li>
        </ul>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="refresh-btn" onClick={fetchOrders}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Verification</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.approvedOrders}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <XCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.rejectedOrders}</h3>
              <p>Rejected</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <IndianRupee size={24} />
            </div>
            <div className="stat-content">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.todayOrders}</h3>
              <p>Today&apos;s Orders</p>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email, UTR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="orders-table">
            <div className="empty-state">
              <ShoppingCart size={64} />
              <h3>No Orders Found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          </div>
        ) : (
          <div className="orders-table">
            <div className="table-header">
              <div>Order ID</div>
              <div>Customer</div>
              <div>Total</div>
              <div>Date</div>
              <div>UTR</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {filteredOrders.map((order) => (
              <div className="order-row" key={order.order_id}>
                <div className="order-id">{order.order_id}</div>
                <div className="customer-info">
                  <span className="customer-name">{order.name}</span>
                  <span className="customer-email">{order.email}</span>
                </div>
                <div className="order-total">₹{order.total.toLocaleString()}</div>
                <div className="order-date">{formatDate(order.date)}</div>
                <div>{order.utr || "—"}</div>
                <div>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status === "approved" && <CheckCircle size={12} />}
                    {order.status === "pending" && <Clock size={12} />}
                    {order.status === "rejected" && <XCircle size={12} />}
                    {order.status}
                  </span>
                </div>
                <div className="action-btns">
                  <button 
                    className="btn btn-view"
                    onClick={() => viewOrderDetails(order)}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  {order.status === "pending" && (
                    <>
                      <button 
                        className="btn btn-approve"
                        onClick={() => handleApprove(order.order_id)}
                        disabled={processing === order.order_id}
                      >
                        <Check size={14} />
                        {processing === order.order_id ? "..." : "Approve"}
                      </button>
                      <button 
                        className="btn btn-reject"
                        onClick={() => handleReject(order.order_id)}
                        disabled={processing === order.order_id}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/api/admin/logout" className="logout-btn">
          <LogOut size={16} />
          Logout
        </Link>
      </main>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Order Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">{selectedOrder.order_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(selectedOrder.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge status-${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">UTR Number</span>
                  <span className="detail-value">{selectedOrder.utr || "Not provided"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedOrder.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedOrder.email}</span>
                </div>
                {selectedOrder.phone && (
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selectedOrder.phone}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Items</h4>
                <div className="items-list">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: OrderItem, idx: number) => (
                    <div className="item-row" key={idx}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  ))}
                  <div className="item-row" style={{ borderTop: "2px solid #e0e0e0", marginTop: "8px", paddingTop: "16px" }}>
                    <span className="item-name" style={{ fontWeight: 700 }}>Total</span>
                    <span className="item-price" style={{ fontSize: "18px", color: "var(--primary)" }}>₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              {selectedOrder.status === "pending" && (
                <>
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      handleReject(selectedOrder.order_id);
                      setShowModal(false);
                    }}
                    disabled={processing === selectedOrder.order_id}
                  >
                    <X size={16} />
                    Reject
                  </button>
                  <button 
                    className="btn-success"
                    onClick={() => {
                      handleApprove(selectedOrder.order_id);
                      setShowModal(false);
                    }}
                    disabled={processing === selectedOrder.order_id}
                  >
                    <Check size={16} />
                    Approve & Send Link
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
