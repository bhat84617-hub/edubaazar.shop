"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, Eye, FileText, LogOut, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import type { Order } from "@/lib/store";

type View = "all" | "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [view, setView] = useState<View>("pending");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [decision, setDecision] = useState<{ order: Order; status: "approved" | "rejected" } | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);

  const flash = (text: string, error = false) => {
    setNotice({ text, error });
    window.setTimeout(() => setNotice(null), 4500);
  };

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "same-origin" })
      .then((response) => { if (response.ok) setAuthed(true); else window.location.replace("/admin/login"); })
      .catch(() => window.location.replace("/admin/login"));
  }, []);

  const loadOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/orders/status", { cache: "no-store", credentials: "same-origin" });
      if (response.status === 401) { window.location.replace("/admin/login"); return; }
      if (!response.ok) throw new Error("Orders could not be loaded");
      const data = await response.json() as { orders?: Order[] };
      setOrders(data.orders || []);
    } catch (error) { flash(error instanceof Error ? error.message : "Orders could not be loaded", true); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const initialLoad = window.setTimeout(loadOrders, 0);
    const timer = window.setInterval(loadOrders, 15000);
    return () => { window.clearTimeout(initialLoad); window.clearInterval(timer); };
  }, [authed, loadOrders]);

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    approved: orders.filter((order) => order.status === "approved").length,
    rejected: orders.filter((order) => order.status === "rejected").length,
  }), [orders]);

  const filtered = useMemo(() => orders.filter((order) => {
    const text = `${order.orderId} ${order.name} ${order.email} ${order.phone} ${order.utr} ${order.items.map((item) => item.name).join(" ")}`.toLowerCase();
    return (view === "all" || order.status === view) && text.includes(query.toLowerCase().trim());
  }), [orders, query, view]);

  const openDecision = (order: Order, status: "approved" | "rejected") => {
    setLinks(Object.fromEntries(order.items.map((item) => [item.id, item.downloadUrl || ""])));
    setDecision({ order, status });
  };

  const submitDecision = async () => {
    if (!decision) return;
    if (decision.status === "approved" && decision.order.items.some((item) => !/^https?:\/\//i.test(links[item.id] || ""))) {
      flash("Har item ke liye valid course link required hai.", true); return;
    }
    setBusy(decision.order.orderId);
    try {
      const response = await fetch("/api/admin/orders/status", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ orderId: decision.order.orderId, status: decision.status, downloadUrls: links }),
      });
      const data = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Request update failed");
      setOrders((current) => current.map((order) => order.orderId === decision.order.orderId
        ? { ...order, status: decision.status, items: order.items.map((item) => ({ ...item, downloadUrl: links[item.id] || item.downloadUrl })) } : order));
      flash(decision.status === "approved" ? "Payment approved. Course links emailed to customer." : "Payment request rejected.");
      setDecision(null); setSelected(null);
    } catch (error) { flash(error instanceof Error ? error.message : "Request update failed", true); }
    finally { setBusy(null); }
  };

  const exportCsv = () => {
    const header = "Order ID,Customer,Email,Phone,Items,Amount,UTR,Status,Date\n";
    const rows = orders.map((order) => [order.orderId, order.name, order.email, order.phone, order.items.map((item) => item.name).join("; "), order.total, order.utr || "", order.status, order.date]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
    const url = URL.createObjectURL(new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "edubazar-orders.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  if (!authed || loading) return <main className="admin-loading"><ShieldCheck size={28} /> Loading admin panel...</main>;

  return <main className="admin-shell">
    <header className="admin-header"><div className="admin-brand"><div className="admin-brand-icon"><ShieldCheck size={23} /></div><div><strong>EduBazar</strong><small>Payment control center</small></div></div><div className="admin-header-actions"><button className="admin-button secondary" onClick={loadOrders} disabled={refreshing}><RefreshCw size={15} /> Refresh</button><button className="admin-button secondary" onClick={exportCsv}><Download size={15} /> Export CSV</button><button className="admin-button dark" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.replace("/"); }}><LogOut size={15} /> Logout</button></div></header>
    {notice && <div className={`admin-notice ${notice.error ? "error" : "success"}`}>{notice.error ? <X size={18} /> : <Check size={18} />}{notice.text}</div>}
    <section className="admin-intro"><div><p className="admin-eyebrow">MANUAL PAYMENT VERIFICATION</p><h1>Orders & payment requests</h1><p>Review UTR, confirm the amount, and approve only verified payments.</p></div><Link href="/" className="admin-store-link"><ExternalLink size={15} /> View store</Link></section>
    <section className="admin-stats">{(["pending", "approved", "rejected", "all"] as View[]).map((key) => <button key={key} className={`admin-stat ${view === key ? "active" : ""}`} onClick={() => setView(key)}><strong>{counts[key]}</strong><small>{key === "pending" ? "Pending review" : key[0].toUpperCase() + key.slice(1) + " requests"}</small></button>)}</section>
    <section className="admin-panel"><div className="admin-toolbar"><div><h2>{view === "pending" ? "Pending payment requests" : `${view[0].toUpperCase()}${view.slice(1)} requests`}</h2><p>{filtered.length} request{filtered.length === 1 ? "" : "s"} shown</p></div><label className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, email or UTR" /></label></div>
      {filtered.length === 0 ? <div className="admin-empty"><FileText size={38} /><h3>{query ? "No matching requests" : "No requests in this view"}</h3><p>New UPI payment requests will appear here automatically.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Request</th><th>Customer</th><th>Amount</th><th>UTR / Ref ID</th><th>Submitted</th><th>Status</th><th>Decision: YES / NO</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.orderId}><td><strong>{order.orderId}</strong><small>{order.items.length} item{order.items.length === 1 ? "" : "s"}</small></td><td><strong>{order.name}</strong><small>{order.email}</small></td><td><strong className="amount">₹{order.total.toLocaleString("en-IN")}</strong></td><td><code>{order.utr || "Not provided"}</code></td><td>{new Date(order.date).toLocaleDateString("en-IN")}</td><td><span className={`status ${order.status}`}><i />{order.status}</span></td><td><div className="row-actions"><button className="icon-button" title="View request" aria-label="View request" onClick={() => setSelected(order)}><Eye size={16} /></button>{order.status === "pending" && <><button className="action-button approve" onClick={() => openDecision(order, "approved")}><Check size={14} /> YES - Approve</button><button className="action-button reject" onClick={() => openDecision(order, "rejected")}><X size={14} /> NO - Reject</button></>}</div></td></tr>)}</tbody></table></div>}
    </section>
    {selected && <div className="admin-overlay" onMouseDown={() => setSelected(null)}><section className="admin-modal" onMouseDown={(event) => event.stopPropagation()}><ModalHeader title="Payment request" onClose={() => setSelected(null)} /><div className="detail-grid"><div><span>Order ID</span><strong>{selected.orderId}</strong></div><div><span>Status</span><strong className={`status ${selected.status}`}><i />{selected.status}</strong></div><div><span>Customer</span><strong>{selected.name}</strong><small>{selected.email}</small></div><div><span>Phone</span><strong>{selected.phone || "Not provided"}</strong></div><div><span>Amount</span><strong className="amount">₹{selected.total.toLocaleString("en-IN")}</strong></div><div><span>UTR / Reference ID</span><strong>{selected.utr || "Not provided"}<button className="copy-button" onClick={() => selected.utr && navigator.clipboard?.writeText(selected.utr)} aria-label="Copy UTR"><Copy size={14} /></button></strong></div></div><div className="item-list"><h3>Purchased items</h3>{selected.items.map((item) => <div className="item-row" key={item.id}><div><strong>{item.name}</strong><small>Qty {item.qty} · ₹{item.price.toLocaleString("en-IN")}</small></div>{item.downloadUrl && <a href={item.downloadUrl} target="_blank" rel="noreferrer" aria-label="Open course link"><ExternalLink size={15} /></a>}</div>)}</div>{selected.status === "pending" && <div className="modal-footer"><button className="action-button reject" onClick={() => { setSelected(null); openDecision(selected, "rejected"); }}><X size={15} /> Reject request</button><button className="action-button approve" onClick={() => { setSelected(null); openDecision(selected, "approved"); }}><Check size={15} /> Review & approve</button></div>}</section></div>}
    {decision && <div className="admin-overlay"><section className="admin-modal decision-modal"><ModalHeader title={decision.status === "approved" ? "Approve payment" : "Reject payment"} onClose={() => setDecision(null)} /><p className="modal-help">{decision.status === "approved" ? "Confirm the UTR and every course link. Approval unlocks dashboard access and sends the customer an email." : "This request will be rejected. No course link will be sent."}</p>{decision.status === "approved" && <div className="link-editor"><h3>Course access links</h3>{decision.order.items.map((item) => <label key={item.id}>{item.name}<div className="link-input"><ExternalLink size={15} /><input value={links[item.id] || ""} onChange={(event) => setLinks((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="https://course-link.example/..." /></div></label>)}</div>}<div className="decision-summary"><span>Customer</span><strong>{decision.order.name} · {decision.order.email}</strong><span>Amount</span><strong>₹{decision.order.total.toLocaleString("en-IN")} · UTR {decision.order.utr || "not provided"}</strong></div><div className="modal-footer"><button className="admin-button secondary" onClick={() => setDecision(null)}>Cancel</button><button className={`action-button ${decision.status === "approved" ? "approve" : "reject"}`} disabled={busy === decision.order.orderId} onClick={submitDecision}>{busy === decision.order.orderId ? "Processing..." : decision.status === "approved" ? <><Check size={15} /> Confirm approval</> : <><X size={15} /> Confirm rejection</>}</button></div></section></div>}
  </main>;
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) { return <div className="modal-header"><div><p className="admin-eyebrow">ADMIN ACTION</p><h2>{title}</h2></div><button className="modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button></div>; }
