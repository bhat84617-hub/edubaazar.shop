"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { getProductById, formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const { cart, removeFromCart, setQty, cartSubtotal, mounted } = useStore();

  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Cart</span>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "#242424" }}>Shopping Cart</h1>
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
              <div className="sum-row"><span>Delivery</span><span>Instant (Digital)</span></div>
              <div className="sum-row total"><span>Total</span><span>{formatINR(cartSubtotal)}</span></div>
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