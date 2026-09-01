"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Heart, Scale, Minus, Plus, Star, Clock, Signal, Users, Download, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function ProductBuy({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, toggleCompare, wishlist, compare, showToast } = useStore();
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);

  const variant = product.variants?.[variantIdx];
  const price = (variant?.price ?? product.price) * qty;
  const free = price <= 0;
  const inWish = wishlist.includes(product.id);
  const inCmp = compare.includes(product.id);

  return (
    <>
      <div className="qv-meta" style={{ marginBottom: 16 }}>
        <span><Clock size={13} /> {product.duration}</span>
        <span><Signal size={13} /> {product.level}</span>
        <span><Users size={13} /> {product.students} students</span>
        <span><Star size={13} style={{ color: "#f5a623" }} /> {product.rating} ({product.reviewCount})</span>
      </div>

      {product.variants && product.variants.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            {product.variants[0].name}
          </div>
          <div className="variant-row">
            {product.variants.map((v, i) => (
              <button
                key={v.value}
                className={`variant-btn ${i === variantIdx ? "active" : ""}`}
                disabled={v.stock <= 0}
                onClick={() => setVariantIdx(i)}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="qv-price-row" style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        {!free && product.oldPrice > 0 && (
          <span className="old">{formatINR(product.oldPrice * qty)}</span>
        )}
        <span className="new" style={{ color: "#2A74ED" }}>{free ? "FREE" : formatINR(price)}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="qty-stepper">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={14} /></button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)} aria-label="Increase"><Plus size={14} /></button>
        </div>
        <span style={{ fontSize: 12, color: "#777", background: "#f8f9fb", padding: "4px 10px", borderRadius: 20, border: "1px solid #E5E5E5" }}>{variant?.stock ?? 999} in stock</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          className="btn btn-primary single_add_to_cart_button"
          style={{ borderRadius: 20, flex: 1, fontWeight: 700, background: "#2A74ED", borderColor: "#2A74ED" }}
          onClick={() => {
            addToCart(product.id, qty, variant?.value);
          }}
        >
          <ShoppingCart size={15} /> Add to cart — {free ? "FREE" : formatINR(price)}
        </button>
        <button
          className={`p-action-btn ${inWish ? "active" : ""}`}
          style={{ width: 48, height: 48 }}
          onClick={() => {
            toggleWishlist(product.id);
            showToast(inWish ? "Removed from wishlist" : "Added to wishlist!");
          }}
          aria-label="Wishlist"
        >
          <Heart size={19} />
        </button>
        <button
          className={`p-action-btn ${inCmp ? "active" : ""}`}
          style={{ width: 48, height: 48 }}
          onClick={() => {
            toggleCompare(product.id);
            showToast(inCmp ? "Removed from compare" : "Added to compare");
          }}
          aria-label="Compare"
        >
          <Scale size={19} />
        </button>
      </div>

      {product.downloadUrl && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#2A74ED", fontWeight: 700, background: "#eef3ff", padding: "8px 12px", borderRadius: 20, border: "1px solid #d6e3ff" }}>
          <Download size={13} /> Accessible via dashboard download after approval
        </div>
      )}

      <div className="trust-row" style={{ marginTop: 18 }}>
        <div className="trust-chip"><ShieldCheck size={14} /> 100% Secure UPI</div>
        <div className="trust-chip"><ShieldCheck size={14} /> Instant Access</div>
        <div className="trust-chip"><ShieldCheck size={14} /> Lifetime Validity</div>
        <div className="trust-chip"><ShieldCheck size={14} /> 24/7 Support</div>
      </div>

      <div style={{ marginTop: 22, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.7 }}>
        <ShieldCheck size={13} style={{ verticalAlign: "-2px" }} /> Payment verify hone ke baad aapko course
        access / download link mil jayega — <Link href="/checkout">checkout page</Link> par karein.
      </div>
    </>
  );
}