"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, ShieldCheck, Wallet, ArrowRight, ArrowLeft, LayoutDashboard, ShoppingBag, PartyPopper, Lock } from "lucide-react";
import { getProductById, formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";
import { STORE, upiLink } from "@/lib/config";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, user, mounted, placeOrder, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: "" });
  const [err, setErr] = useState("");
  const [utr, setUtr] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; total: number } | null>(null);

  const total = cartSubtotal;

  const nextFromDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || form.phone.replace(/\D/g, "").length < 10) {
      setErr("Please fill valid name, email and 10-digit phone number.");
      return;
    }
    setErr("");
    setStep(2);
  };

  const submitPayment = async () => {
    if (total > 0) {
      const digits = utr.trim().replace(/\D/g, "");
      if (digits.length < 10) {
        showToast("Please enter a valid UPI Transaction ID (10-13 digits)", "error");
        return;
      }
      if (digits.length > 14) {
        showToast("Transaction ID too long. Please check and try again.", "error");
        return;
      }
    }
    setPlacing(true);
    const order = await placeOrder({ name: form.name, email: form.email, phone: form.phone, utr });
    setPlacing(false);
    if (order) {
      setPlaced({ id: order.orderId, total: order.total });
      setStep(3);
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          orderId: order.orderId,
          name: form.name,
          email: form.email,
          items: order.items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
          total: order.total,
          utr,
        }),
      }).catch(() => {});
    }
  };

  if (mounted && !user) {
    return (
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="dash-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
            <Lock size={48} style={{ color: "var(--line)", marginBottom: 14 }} />
            <h3 style={{ marginBottom: 8 }}>Login Required</h3>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>Please login or create an account to purchase courses.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/login" className="btn btn-primary">Login</Link>
              <Link href="/register" className="btn btn-outline">Sign Up</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (mounted && cart.length === 0 && !placed) {
    return (
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="dash-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
            <ShoppingBag size={48} style={{ color: "var(--line)", marginBottom: 14 }} />
            <h3 style={{ marginBottom: 8 }}>Your cart is empty</h3>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>Add products before checking out.</p>
            <Link href="/shop" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </section>
    );
  }

  if (step === 3 && placed) {
    return (
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="dash-panel success-wrap" style={{ padding: "50px 30px" }}>
            <div className="success-circle">
              {placed.total > 0 ? <ShieldCheck size={40} /> : <PartyPopper size={40} />}
            </div>
            <h2>{placed.total > 0 ? "Order Placed!" : "You're In!"}</h2>
            <p className="sub">
              {placed.total > 0
                ? "Your UPI payment is under verification. Admin will approve your order shortly."
                : "Your free product is ready. Access it right away from your dashboard."}
            </p>
            <p className="oid">Order ID: {placed.id}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
              Total: <strong style={{ color: "var(--primary)" }}>{placed.total > 0 ? formatINR(placed.total) : "FREE"}</strong>
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/account" className="btn btn-primary">
                <LayoutDashboard size={16} /> Go to Dashboard
              </Link>
              <Link href="/shop" className="btn btn-outline">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-pad">
      <div className="container">
        <div className="checkout-steps">
          <div className={`cstep ${step === 1 ? "active" : "done"}`}>
            <span>1</span> Details
          </div>
          <div className={`cstep ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
            <span>2</span> Payment
          </div>
          <div className={`cstep ${step >= 3 ? "active" : ""}`}>
            <span>3</span> Done
          </div>
        </div>

        <div className="checkout-grid">
          <div className="pay-card">
            {step === 1 && (
              <>
                <h3>Your Details <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>· Welcome {user?.name}</span></h3>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
                  Completing purchase as <strong>{user?.email}</strong>
                </p>
                <form onSubmit={nextFromDetails}>
                  <div className="field">
                    <label>Full Name</label>
                    <input
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                  {err && <div className="auth-alert show error" style={{ display: "block" }}>{err}</div>}
                  <button className="btn btn-primary btn-block" type="submit">
                    Continue to Payment <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h3><Wallet size={18} style={{ verticalAlign: "-3px", color: "var(--primary)" }} /> UPI Payment</h3>
                <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 18 }}>
                  Scan the QR or pay to UPI ID <strong style={{ color: "var(--primary)" }}>{STORE.upiId}</strong>, then enter your transaction ID.
                </p>

                <div className="upi-panel">
                  <img src="/images/payment-qr.jpeg" alt="UPI QR Code" />
                  <div className="upi-app-row">
                    <span>GPay</span><span>PhonePe</span><span>Paytm</span><span>Any UPI app</span>
                  </div>
                  {total > 0 && (
                    <a
                      href={upiLink(total)}
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: 14 }}
                      onClick={() => showToast("Opening UPI app...")}
                    >
                      <ExternalLink size={14} /> Pay ₹{total.toLocaleString("en-IN")}
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", margin: "16px 0 6px", fontSize: 12.5, color: "var(--muted)" }}>
                  or send to UPI ID
                </div>
                <div className="header-search" style={{ marginBottom: 18 }}>
                  <input readOnly value={STORE.upiId} onClick={(e) => (e.target as HTMLInputElement).select()} />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(STORE.upiId);
                      showToast("UPI ID copied!");
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {total > 0 ? (
                  <div className="field">
                    <label>UPI Transaction ID (UTR / Ref ID)</label>
                    <input
                      placeholder="e.g. 385912345678"
                      value={utr}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 14);
                        setUtr(cleaned);
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={14}
                    />
                    <small style={{ color: "var(--muted)", fontSize: 11.5, display: "block", marginTop: 4 }}>
                      UPI app me transaction ID copy karein aur yahan paste karein. Sirf numbers dalein.
                    </small>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", fontSize: 14, color: "var(--primary)", fontWeight: 700, margin: "10px 0" }}>
                    This is a free product — no payment needed!
                  </p>
                )}

                <button className="btn btn-primary btn-block" onClick={submitPayment} disabled={placing}>
                  <CheckCircle2 size={16} /> {placing ? "Placing order..." : total > 0 ? "I Have Paid — Submit" : "Get Free Access"}
                </button>
                <button className="btn btn-outline btn-block" style={{ marginTop: 10 }} onClick={() => setStep(1)}>
                  <ArrowLeft size={15} /> Back to Details
                </button>
              </>
            )}
          </div>

          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="checkout-items">
              {mounted &&
                cart.map((item) => {
                  const p = getProductById(item.id);
                  if (!p) return null;
                  return (
                    <div key={item.id} className="co-item">
                      <img src={p.images[0]} alt={p.title} />
                      <div style={{ flex: 1 }}>
                        <h5>{p.title}</h5>
                        <p>Qty: {item.qty}</p>
                      </div>
                      <span className="price">{p.price <= 0 ? "FREE" : formatINR(p.price * item.qty)}</span>
                    </div>
                  );
                })}
            </div>
            <div className="sum-row"><span>Subtotal</span><span>{formatINR(cartSubtotal)}</span></div>
            <div className="sum-row"><span>Delivery</span><span>Instant (Digital)</span></div>
            <div className="sum-row total"><span>Total</span><span>{total <= 0 ? "FREE" : formatINR(total)}</span></div>
            <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--muted)", justifyContent: "center", marginTop: 14 }}>
              <ShieldCheck size={14} style={{ color: "var(--primary)" }} /> Verified by admin before access
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}