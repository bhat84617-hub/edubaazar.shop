"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, CheckCircle, Clock, XCircle,
  IndianRupee, Search, RefreshCw, LogOut, Eye, Check, X,
  TrendingUp, Package, Download, ExternalLink, Bell, Menu, XIcon,
} from "lucide-react";
import { getProductById } from "@/lib/products";

/* ── types ─────────────────────────────────────────────────────────── */
interface OrderItem {
  id: string;
  name: string;
  price: number;
  img?: string;
  qty?: number;
  downloadUrl?: string | null;
}

interface Order {
  orderId: string;
  name: string;
  email: string;
  phone?: string;
  items: OrderItem[];
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

/* ── page ──────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<{ id: number; msg: string; ok: boolean }[]>([]);
  const [showNav, setShowNav] = useState(false);
  const toastId = useRef(0);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, pendingOrders: 0, approvedOrders: 0,
    rejectedOrders: 0, totalRevenue: 0, todayOrders: 0,
  });

  /* ── stats ───────────────────────────────────────────────────────── */
  const calcStats = useCallback((data: Order[]) => {
    const today = new Date().toDateString();
    setStats({
      totalOrders: data.length,
      pendingOrders: data.filter((o) => o.status === "pending").length,
      approvedOrders: data.filter((o) => o.status === "approved").length,
      rejectedOrders: data.filter((o) => o.status === "rejected").length,
      totalRevenue: data
        .filter((o) => o.status === "approved")
        .reduce((s, o) => s + o.total, 0),
      todayOrders: data.filter((o) => new Date(o.date).toDateString() === today).length,
    });
  }, []);

  /* ── fetch via SERVER API (no client-side secret) ─────────────────── */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/orders/status", { cache: "no-store" });
      if (r.status === 401) { window.location.href = "/admin/login"; return; }
      if (!r.ok) throw new Error("Failed to fetch orders");
      const { orders: data } = (await r.json()) as { orders: Order[] };
      setOrders(data);
      calcStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders");
    }
    setLoading(false);
  }, [calcStats]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { const t = setInterval(fetchOrders, 20000); return () => clearInterval(t); }, [fetchOrders]);

  /* ── filter ───────────────────────────────────────────────────────── */
  useEffect(() => {
    let res = orders;
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(
        (o) =>
          o.orderId.toLowerCase().includes(s) ||
          o.name.toLowerCase().includes(s) ||
          o.email.toLowerCase().includes(s) ||
          (o.utr ?? "").toLowerCase().includes(s)
      );
    }
    if (statusFilter !== "all") res = res.filter((o) => o.status === statusFilter);
    setFiltered(res);
  }, [orders, search, statusFilter]);

  /* ── approve / reject (server API with session cookie) ────────────── */
  const act = async (orderId: string, status: "approved" | "rejected") => {
    setProcessing(orderId);
    try {
      const order = orders.find((o) => o.orderId === orderId);
      const items = order?.items ?? [];

      const body: Record<string, unknown> = { orderId, status };
      if (status === "approved") {
        // merge current input values into items
        const merged = items.map((it) => ({
          ...it,
          downloadUrl: downloadUrls[it.id || it.name] || it.downloadUrl || "",
        }));
        body.downloadUrls = Object.fromEntries(merged.map((it) => [it.id || it.name, it.downloadUrl]));
      }

      const r = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Action failed");

      toast(status === "approved" ? `✅ Order ${orderId} approved & email sent` : `❌ Order ${orderId} rejected`);
      await fetchOrders();
      setShowModal(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Something went wrong", false);
    }
    setProcessing(null);
  };

  const toast = (msg: string, ok = true) => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, ok }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  /* ── helpers ──────────────────────────────────────────────────────── */
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  const parseItems = (o: Order) =>
    Array.isArray(o.items) ? o.items : JSON.parse(o.items as string);

  /* ── open modal: pre-fill download URLs from items + product catalog ── */
  const openDetail = (o: Order) => {
    const merged: Record<string, string> = {};
    parseItems(o).forEach((it: OrderItem) => {
      const productUrl = getProductById(it.id)?.downloadUrl || "";
      // Admin can always override. Auto-fill from product if nothing set yet.
      merged[it.id || it.name] = it.downloadUrl || productUrl || "";
    });
    setDownloadUrls(merged);
    setSelected(o);
    setShowModal(true);
  };

  /* ── pending count for sidebar badge ──────────────────────────── */
  const pendingCount = stats.pendingOrders;

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div className="adm">
      <style jsx global>{`
        @keyframes admSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes admPulse{0%,100%{opacity:1}50%{opacity:.45}}
        @keyframes admSlide{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes admIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        .adm *{margin:0;padding:0;box-sizing:border-box}
        .adm{display:flex;min-height:100vh;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,system-ui,sans-serif;color:#e4e6eb}

        /* sidebar */
        .adm-aside{width:248px;background:linear-gradient(195deg,#13141a 0%,#1a1c25 100%);position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column;z-index:20;border-right:1px solid rgba(255,255,255,.06)}
        .adm-brand{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.06)}
        .adm-brand h2{font-size:18px;font-weight:700;color:#fff;letter-spacing:-.3px}
        .adm-brand p{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.35);margin-top:2px}
        .adm-nav{flex:1;padding:10px 0}
        .adm-nav a,.adm-nav button{display:flex;align-items:center;gap:11px;padding:11px 20px;color:rgba(255,255,255,.45);text-decoration:none;font-size:13.5px;font-weight:500;border:none;background:none;width:100%;text-align:left;cursor:pointer;transition:all .15s;border-left:3px solid transparent}
        .adm-nav a:hover,.adm-nav button:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.85)}
        .adm-nav a.active,.adm-nav button.active{color:#fff;background:rgba(255,255,255,.07);border-left-color:#818cf8}
        .adm-badge{margin-left:auto;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;min-width:20px;text-align:center}
        .adm-foot{padding:14px 20px;border-top:1px solid rgba(255,255,255,.06)}
        .adm-foot a{display:flex;align-items:center;gap:9px;color:rgba(255,255,255,.35);text-decoration:none;font-size:12.5px;padding:7px 0}
        .adm-foot a:hover{color:rgba(255,255,255,.8)}

        /* main area */
        .adm-main{flex:1;margin-left:248px;padding:28px 32px;animation:admSlide .35s ease}
        .adm-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px}
        .adm-top h1{font-size:24px;font-weight:700;color:#f0f1f5;letter-spacing:-.3px}
        .adm-top-actions{display:flex;gap:8px;align-items:center}
        .adm-refresh{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#c4c7cd;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s}
        .adm-refresh:hover{background:rgba(255,255,255,.1);color:#fff}
        .adm-refresh svg.spin{animation:admSpin .7s linear infinite}

        /* stat cards */
        .adm-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-bottom:24px}
        .adm-stat{background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px 16px;display:flex;align-items:center;gap:12px;transition:transform .15s,box-shadow .15s}
        .adm-stat:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.25)}
        .adm-ic{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .adm-stat h3{font-size:22px;font-weight:700;color:#f0f1f5}
        .adm-stat p{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px}
        .ic-total{background:rgba(99,102,241,.15);color:#818cf8}
        .ic-pending{background:rgba(251,191,36,.15);color:#fbbf24}
        .ic-ok{background:rgba(52,211,153,.15);color:#34d399}
        .ic-no{background:rgba(248,113,113,.15);color:#f87171}
        .ic-rev{background:rgba(167,139,250,.15);color:#a78bfa}
        .ic-today{background:rgba(56,189,248,.15);color:#38bdf8}

        /* toolbar */
        .adm-toolbar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:14px 18px;margin-bottom:18px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        .adm-search{flex:1;min-width:200px;position:relative;display:flex;align-items:center}
        .adm-search svg{position:absolute;left:12px;color:rgba(255,255,255,.25)}
        .adm-search input{width:100%;padding:9px 12px 9px 38px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#e4e6eb;font-size:13px;outline:none;transition:border .15s}
        .adm-search input::placeholder{color:rgba(255,255,255,.25)}
        .adm-search input:focus{border-color:rgba(129,140,248,.5)}
        .adm-sel{padding:9px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#e4e6eb;font-size:13px;outline:none;cursor:pointer}
        .adm-sel option{background:#1a1c25;color:#e4e6eb}

        /* table */
        .adm-table-wrap{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden}
        .adm-table{width:100%;border-collapse:collapse}
        .adm-table th{padding:13px 18px;text-align:left;font-size:10.5px;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.8px;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.06)}
        .adm-table td{padding:13px 18px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
        .adm-table tr{transition:background .12s}
        .adm-table tbody tr:hover{background:rgba(255,255,255,.03)}
        .adm-table tbody tr.pending-row{background:rgba(251,191,36,.04)}
        .adm-table tbody tr.pending-row:hover{background:rgba(251,191,36,.08)}
        .adm-oid{font-family:'SF Mono',Consolas,monospace;font-weight:600;color:#818cf8;font-size:12px}
        .adm-cust strong{display:block;color:#f0f1f5;font-size:13.5px}
        .adm-cust span{font-size:11.5px;color:rgba(255,255,255,.35)}
        .adm-total{font-weight:700;color:#f0f1f5}
        .adm-date{color:rgba(255,255,255,.4);font-size:12px}
        .adm-utr{font-family:'SF Mono',Consolas,monospace;font-size:11.5px;color:rgba(255,255,255,.4);max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .adm-badge-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
        .bp-pending{background:rgba(251,191,36,.15);color:#fbbf24}
        .bp-approved{background:rgba(52,211,153,.15);color:#34d399}
        .bp-rejected{background:rgba(248,113,113,.15);color:#f87171}
        .adm-acts{display:flex;gap:5px}
        .abtn{padding:6px 10px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all .12s}
        .abtn-view{background:rgba(99,102,241,.12);color:#818cf8}
        .abtn-ok{background:rgba(52,211,153,.12);color:#34d399}
        .abtn-no{background:rgba(248,113,113,.12);color:#f87171}
        .abtn:hover{filter:brightness(1.15);transform:translateY(-1px)}
        .abtn:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .adm-empty{text-align:center;padding:60px 20px;color:rgba(255,255,255,.3)}

        /* modal */
        .adm-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100;animation:admIn .2s ease}
        .adm-modal{background:#1a1c25;border:1px solid rgba(255,255,255,.08);border-radius:16px;width:94%;max-width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5)}
        .adm-modal::-webkit-scrollbar{width:6px}
        .adm-modal::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
        .adm-modal-top{padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;justify-content:space-between;align-items:center}
        .adm-modal-top h2{font-size:17px;font-weight:700;color:#f0f1f5}
        .adm-modal-close{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:8px;cursor:pointer;color:rgba(255,255,255,.4);padding:5px;display:flex;transition:all .12s}
        .adm-modal-close:hover{background:rgba(255,255,255,.1);color:#fff}
        .adm-modal-body{padding:20px 22px}
        .adm-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}
        .adm-detail-item label{display:block;font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:3px}
        .adm-detail-item span{font-size:13.5px;font-weight:600;color:#e4e6eb}
        .adm-items-sec{margin-top:16px}
        .adm-items-sec h3{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:10px;text-transform:uppercase;letter-spacing:.8px;font-weight:600}
        .adm-item-card{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:8px}
        .adm-item-card strong{font-size:13.5px;color:#f0f1f5}
        .adm-item-card .price{color:#818cf8;font-weight:700;font-size:13px}
        .adm-dl-sec{margin-top:16px;padding:16px;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.15);border-radius:10px}
        .adm-dl-sec h4{font-size:12px;color:#34d399;margin-bottom:10px;display:flex;align-items:center;gap:6px}
        .adm-dl-item{margin-bottom:10px}
        .adm-dl-item label{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:4px}
        .adm-dl-input{width:100%;padding:9px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#e4e6eb;font-size:12.5px;outline:none;transition:border .15s}
        .adm-dl-input::placeholder{color:rgba(255,255,255,.2)}
        .adm-dl-input:focus{border-color:rgba(52,211,153,.4)}
        .adm-modal-foot{padding:16px 22px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;justify-content:flex-end}
        .adm-mbtn{padding:10px 20px;border:none;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .12s}
        .adm-mbtn-green{background:#22c55e;color:#fff}
        .adm-mbtn-red{background:#ef4444;color:#fff}
        .adm-mbtn-gray{background:rgba(255,255,255,.08);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.08)}
        .adm-mbtn:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .adm-mbtn:disabled{opacity:.45;cursor:not-allowed;transform:none}

        /* toast */
        .adm-toasts{position:fixed;top:20px;right:20px;z-index:200;display:flex;flex-direction:column;gap:8px}
        .adm-toast{padding:12px 18px;border-radius:10px;font-size:12.5px;font-weight:600;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.4);animation:admIn .2s ease;white-space:nowrap}
        .adm-toast-ok{background:linear-gradient(135deg,#22c55e,#16a34a)}
        .adm-toast-err{background:linear-gradient(135deg,#ef4444,#dc2626)}

        @media(max-width:1100px){.adm-stats{grid-template-columns:repeat(3,1fr)}.adm-table th:nth-child(6),.adm-table td:nth-child(6){display:none}}
        @media(max-width:768px){.adm-aside{display:none}.adm-main{margin-left:0;padding:16px}.adm-stats{grid-template-columns:1fr 1fr}.adm-table th:nth-child(5),.adm-table td:nth-child(5),.adm-table th:nth-child(6),.adm-table td:nth-child(6){display:none}}
      `}</style>

      {/* ── sidebar ──────────────────────────────────────────────── */}
      <aside className="adm-aside">
        <div className="adm-brand">
          <h2>EduBazar</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="adm-nav">
          <a href="/admin" className="active"><LayoutDashboard size={17} /> Dashboard</a>
          <a href="/"><ShoppingCart size={17} /> View Store</a>
          <a href="/admin/seo"><TrendingUp size={17} /> SEO Tools</a>
          {pendingCount > 0 && (
            <a href="/admin" style={{ marginTop: 8 }}>
              <Bell size={17} /> Pending Requests <span className="adm-badge">{pendingCount}</span>
            </a>
          )}
        </nav>
        <div className="adm-foot">
          <a href="/api/admin/logout"><LogOut size={15} /> Logout</a>
        </div>
      </aside>

      {/* ── main ──────────────────────────────────────────────────── */}
      <main className="adm-main">
        <div className="adm-top">
          <h1>Dashboard</h1>
          <div className="adm-top-actions">
            {pendingCount > 0 && (
              <span style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: "rgba(251,191,36,.12)", color: "#fbbf24",
                display: "flex", alignItems: "center", gap: 6,
                animation: "admPulse 2s ease infinite",
              }}>
                <Bell size={13} /> {pendingCount} Pending
              </span>
            )}
            <button className="adm-refresh" onClick={fetchOrders}>
              <RefreshCw size={14} className={!loading ? "" : "spin"} /> Refresh
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="adm-stats">
          <div className="adm-stat"><div className="adm-ic ic-total"><Package size={20} /></div><div><h3>{stats.totalOrders}</h3><p>Total Orders</p></div></div>
          <div className="adm-stat"><div className="adm-ic ic-pending"><Clock size={20} /></div><div><h3>{stats.pendingOrders}</h3><p>Pending</p></div></div>
          <div className="adm-stat"><div className="adm-ic ic-ok"><CheckCircle size={20} /></div><div><h3>{stats.approvedOrders}</h3><p>Approved</p></div></div>
          <div className="adm-stat"><div className="adm-ic ic-no"><XCircle size={20} /></div><div><h3>{stats.rejectedOrders}</h3><p>Rejected</p></div></div>
          <div className="adm-stat"><div className="adm-ic ic-rev"><IndianRupee size={20} /></div><div><h3>₹{stats.totalRevenue.toLocaleString("en-IN")}</h3><p>Revenue</p></div></div>
          <div className="adm-stat"><div className="adm-ic ic-today"><TrendingUp size={20} /></div><div><h3>{stats.todayOrders}</h3><p>Today</p></div></div>
        </div>

        {/* toolbar */}
        <div className="adm-toolbar">
          <div className="adm-search">
            <Search size={15} />
            <input
              placeholder="Search by order ID, name, email or UTR…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="adm-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        {/* table */}
        {error ? (
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: 48, textAlign: "center" }}>
            <p style={{ color: "#f87171", marginBottom: 14, fontSize: 14 }}>{error}</p>
            <button className="adm-refresh" onClick={fetchOrders}><RefreshCw size={14} /> Retry</button>
          </div>
        ) : loading && orders.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: 60, textAlign: "center" }}>
            <RefreshCw size={28} style={{ color: "rgba(255,255,255,.2)", animation: "admSpin .8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-table-wrap">
            <div className="adm-empty">
              <ShoppingCart size={44} style={{ marginBottom: 12, opacity: 0.2 }} />
              <p>No orders found</p>
            </div>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>UTR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.orderId} className={o.status === "pending" ? "pending-row" : ""}>
                    <td className="adm-oid">#{o.orderId}</td>
                    <td className="adm-cust">
                      <strong>{o.name}</strong>
                      <span>{o.email}</span>
                    </td>
                    <td className="adm-total">₹{o.total.toLocaleString("en-IN")}</td>
                    <td className="adm-date">{fmtDate(o.date)}</td>
                    <td>
                      <span className={`adm-badge-pill bp-${o.status}`}>
                        {o.status === "pending" ? "⏳" : o.status === "approved" ? "✅" : "❌"} {o.status}
                      </span>
                    </td>
                    <td className="adm-utr" title={o.utr ?? "—"}>{o.utr || "—"}</td>
                    <td>
                      <div className="adm-acts">
                        <button className="abtn abtn-view" onClick={() => openDetail(o)}><Eye size={11} /> View</button>
                        {o.status === "pending" && (
                          <>
                            <button
                              className="abtn abtn-ok"
                              onClick={() => { openDetail(o); }}
                              disabled={processing === o.orderId}
                            ><Check size={11} /> Approve</button>
                            <button
                              className="abtn abtn-no"
                              onClick={() => act(o.orderId, "rejected")}
                              disabled={processing === o.orderId}
                            ><X size={11} /> Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── modal ─────────────────────────────────────────────────── */}
      {showModal && selected && (
        <div className="adm-modal-bg" onClick={() => setShowModal(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-top">
              <h2>Order #{selected.orderId}</h2>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>
                <XIcon size={16} />
              </button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-detail-grid">
                <div className="adm-detail-item">
                  <label>Status</label>
                  <span><span className={`adm-badge-pill bp-${selected.status}`}>{selected.status}</span></span>
                </div>
                <div className="adm-detail-item"><label>Date</label><span>{fmtDate(selected.date)}</span></div>
                <div className="adm-detail-item"><label>Customer</label><span>{selected.name}</span></div>
                <div className="adm-detail-item"><label>Email</label><span style={{ fontSize: 12 }}>{selected.email}</span></div>
                <div className="adm-detail-item"><label>Total</label><span>₹{selected.total.toLocaleString("en-IN")}</span></div>
                <div className="adm-detail-item"><label>UTR</label><span style={{ fontFamily: "monospace", fontSize: 12 }}>{selected.utr || "Not provided"}</span></div>
              </div>

              <div className="adm-items-sec">
                <h3>Items</h3>
                {parseItems(selected).map((item: OrderItem, i: number) => (
                  <div className="adm-item-card" key={i}>
                    <strong>{item.name}</strong>
                    <span className="price">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {selected.status === "pending" && (
                <div className="adm-dl-sec">
                  <h4><Download size={14} /> Add Download Links</h4>
                  {parseItems(selected).map((item: OrderItem, i: number) => (
                    <div className="adm-dl-item" key={i}>
                      <label>{item.name}</label>
                      <input
                        className="adm-dl-input"
                        placeholder="https://drive.google.com/file/d/... ya koi bhi link"
                        value={downloadUrls[item.id || item.name] || ""}
                        onChange={(e) =>
                          setDownloadUrls((p) => ({ ...p, [item.id || item.name]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {selected.status === "approved" && (
                <div className="adm-items-sec" style={{ marginTop: 16 }}>
                  <h3>Approved Download Links</h3>
                  {parseItems(selected).map((item: OrderItem, i: number) => (
                    <div className="adm-item-card" key={i}>
                      <span style={{ fontSize: 13 }}>{item.name}</span>
                      {item.downloadUrl ? (
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="abtn abtn-ok"
                        >
                          <ExternalLink size={11} /> Open Link
                        </a>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>No link</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selected.status === "pending" && (
              <div className="adm-modal-foot">
                <button className="adm-mbtn adm-mbtn-gray" onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  className="adm-mbtn adm-mbtn-red"
                  onClick={() => act(selected.orderId, "rejected")}
                  disabled={processing === selected.orderId}
                >
                  <X size={13} /> Reject
                </button>
                <button
                  className="adm-mbtn adm-mbtn-green"
                  onClick={() => act(selected.orderId, "approved")}
                  disabled={processing === selected.orderId}
                >
                  <Check size={13} /> {processing === selected.orderId ? "Processing…" : "Approve & Send"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── toasts ─────────────────────────────────────────────────── */}
      <div className="adm-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.ok ? "adm-toast-ok" : "adm-toast-err"}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
