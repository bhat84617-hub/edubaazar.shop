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

      <div className="qv-price-row">
        {!free && product.oldPrice > 0 && (
          <span className="old">{formatINR(product.oldPrice * qty)}</span>
        )}
        <span className="new">{free ? "FREE" : formatINR(price)}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div className="qty-stepper">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={14} /></button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)} aria-label="Increase"><Plus size={14} /></button>
        </div>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{variant?.stock ?? 999} in stock</span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            addToCart(product.id, qty, variant?.value);
          }}
        >
          <ShoppingCart size={16} /> Add to Cart — {free ? "FREE" : formatINR(price)}
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
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>
          <Download size={15} /> Accessible via dashboard download after approval
        </div>
      )}

      <div className="trust-row" style={{ marginTop: 26 }}>
        <div className="trust-chip"><ShieldCheck size={18} /> 100% Secure UPI</div>
        <div className="trust-chip"><ShieldCheck size={18} /> Instant Access</div>
        <div className="trust-chip"><ShieldCheck size={18} /> Lifetime Validity</div>
        <div className="trust-chip"><ShieldCheck size={18} /> 24/7 Support</div>
      </div>

      <div style={{ marginTop: 22, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.7 }}>
        <ShieldCheck size={13} style={{ verticalAlign: "-2px" }} /> Payment verify hone ke baad aapko course
        access / download link mil jayega — <Link href="/checkout">checkout page</Link> par karein.
      </div>
    </>
  );
}