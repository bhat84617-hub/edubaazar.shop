"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from "lucide-react";
import { getProductById, formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const { cart, removeFromCart, setQty, cartSubtotal, mounted, showToast } = useStore();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(false);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "EDU50" && !discount) {
      setDiscount(true);
      showToast("Coupon EDU50 applied! 50% off.");
    } else {
      showToast("Invalid coupon code", "error");
    }
  };

  const total = discount ? Math.max(0, Math.round(cartSubtotal * 0.5)) : cartSubtotal;

  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Cart</span>
          <h2>Shopping Cart</h2>
        </div>

        {mounted && cart.length === 0 ? (
          <div className="dash-panel" style={{ textAlign: "center", padding: "70px 20px" }}>
            <ShoppingBag size={52} style={{ color: "var(--line)", marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>Your cart is empty</h3>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>Add some great products to get started!</p>
            <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="checkout-grid">
            <div className="dash-panel">
              {mounted &&
                cart.map((item) => {
                  const p = getProductById(item.id);
                  if (!p) return null;
                  return (
                    <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                      <Link href={`/product/${p.slug}`}>
                        <img src={p.images[0]} alt={p.title} style={{ width: 80, height: 64, objectFit: "cover", borderRadius: 10 }} />
                      </Link>
                      <div style={{ flex: 1 }}>
                        <Link href={`/product/${p.slug}`}>
                          <h5 style={{ fontSize: 14, marginBottom: 2 }}>{p.title}</h5>
                        </Link>
                        <p style={{ fontSize: 12, color: "var(--muted)" }}>{p.category}</p>
                        <strong style={{ color: "var(--primary)", fontSize: 15 }}>{p.price <= 0 ? "FREE" : formatINR(p.price)}</strong>
                      </div>
                      <div className="qty-stepper">
                        <button onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease"><Minus size={13} /></button>
                        <span>{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase"><Plus size={13} /></button>
                      </div>
                      <strong style={{ minWidth: 70, textAlign: "right", fontFamily: "var(--font-heading)", fontSize: 16 }}>
                        {p.price <= 0 ? "FREE" : formatINR(p.price * item.qty)}
                      </strong>
                      <button onClick={() => removeFromCart(item.id)} aria-label="Remove" style={{ background: "none", border: "none", color: "#c0392b" }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}

              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                <div className="header-search" style={{ flex: 1, minWidth: 220 }}>
                  <input placeholder="Coupon code (try EDU50)" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                  <button onClick={applyCoupon}><Tag size={16} /></button>
                </div>
                <Link href="/shop" className="btn btn-outline">Continue Shopping</Link>
              </div>
            </div>

            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="checkout-items">
                {mounted &&
                  cart.slice(0, 4).map((item) => {
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
              {discount && <div className="sum-row"><span>Coupon EDU50 (-50%)</span><span style={{ color: "#22a06b" }}>-{formatINR(Math.round(cartSubtotal * 0.5))}</span></div>}
              <div className="sum-row"><span>Delivery</span><span>Instant (Digital)</span></div>
              <div className="sum-row total"><span>Total</span><span>{formatINR(total)}</span></div>
              <Link href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--muted)", justifyContent: "center", marginTop: 14 }}>
                <ShieldCheck size={14} style={{ color: "var(--primary)" }} /> 100% secure UPI payment
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}