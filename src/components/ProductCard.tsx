"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, Scale, ShoppingCart, Star, X, Users, CheckCircle2, Clock, Signal } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, toggleCompare, wishlist, compare, showToast } = useStore();
  const [qvOpen, setQvOpen] = useState(false);
  const inWish = wishlist.includes(product.id);
  const inCmp = compare.includes(product.id);
  const free = product.price <= 0;
  const discount = !free && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <>
      <article className="p-card content-product">
        <div className="p-image">
          <Link href={`/product/${product.slug}`}>
            <img src={product.images[0]} alt={product.title} loading="lazy" className="first" />
            {product.images[1] ? (
              <img src={product.images[1]} alt={`${product.title} preview`} className="second" loading="lazy" />
            ) : (
              <img src={product.images[0]} alt={`${product.title} preview`} className="second" loading="lazy" />
            )}
          </Link>
          {product.badge && <span className={`p-badge onsale ${product.badge.toLowerCase()}`}>{product.badge}</span>}
          {discount > 0 && (
            <span className="p-badge" style={{ left: product.badge ? "72px" : "10px", background: "#2A74ED", color: "#fff" }}>
              -{discount}%
            </span>
          )}
          <div className="p-actions">
            <button className="p-action-btn" onClick={() => setQvOpen(true)} aria-label="Quick view">
              <Eye size={14} />
            </button>
            <button
              className={`p-action-btn ${inWish ? "active" : ""}`}
              onClick={() => {
                toggleWishlist(product.id);
                showToast(inWish ? "Removed from wishlist" : "Added to wishlist!");
              }}
              aria-label="Wishlist"
            >
              <Heart size={14} fill={inWish ? "currentColor" : "none"} />
            </button>
            <button
              className={`p-action-btn ${inCmp ? "active" : ""}`}
              onClick={() => {
                toggleCompare(product.id);
                showToast(inCmp ? "Removed from compare" : "Added to compare");
              }}
              aria-label="Compare"
            >
              <Scale size={14} />
            </button>
          </div>
        </div>

        <div className="p-body product-details">
          <span className="p-cat">{product.category}</span>
          <Link href={`/product/${product.slug}`} className="p-title">
            {product.title}
          </Link>
          <div className="p-stars">
            <span style={{ display: "flex", gap: 1 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} fill={i < Math.round(product.rating) ? "#FFBD3C" : "none"} color={i < Math.round(product.rating) ? "#FFBD3C" : "#E5E5E5"} />
              ))}
            </span>
            <span style={{ color: "#777", fontSize: 10 }}>({product.reviewCount})</span>
          </div>
          <div className="p-footer">
            <div className="p-prices">
              {!free && product.oldPrice > 0 && <span className="p-old">{formatINR(product.oldPrice)}</span>}
              <span className={`p-new ${free ? "free" : ""}`}>{free ? "FREE" : formatINR(product.price)}</span>
            </div>
          </div>
          <button className="btn-add single_add_to_cart_button" onClick={() => addToCart(product.id)} aria-label="Add to cart">
            <ShoppingCart size={13} /> Add to cart
          </button>
        </div>
      </article>

      {/* Quick view modal */}
      <div className={`modal ${qvOpen ? "open" : ""}`} onClick={() => setQvOpen(false)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Quick View</h3>
            <button className="sheet-x" onClick={() => setQvOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </div>
          <div className="modal-body">
            <div className="qv-grid">
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 16, padding: 5, background: "#f8f9fb" }}>
                <img src={product.images[0]} alt={product.title} style={{ width: "100%", borderRadius: 12, aspectRatio: "1", objectFit: "cover" }} />
              </div>
              <div>
                <span className="qv-cat">{product.category}</span>
                <h3 className="qv-title">{product.title}</h3>
                <p style={{ fontSize: 12, color: "#777", lineHeight: 1.6, marginBottom: 10 }}>{product.desc}</p>
                <div className="qv-meta">
                  <span><Clock size={10} /> {product.duration}</span>
                  <span><Signal size={10} /> {product.level}</span>
                  <span><Users size={10} /> {product.students}</span>
                  <span><Star size={10} style={{ color: "#FFBD3C" }} /> {product.rating} ({product.reviewCount})</span>
                </div>
                <div className="qv-price-row" style={{ marginTop: 12 }}>
                  {!free && product.oldPrice > 0 && <span className="old">{formatINR(product.oldPrice)}</span>}
                  <span className="new">{free ? "FREE" : formatINR(product.price)}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" style={{ borderRadius: 20, flex: 1 }} onClick={() => { addToCart(product.id); setQvOpen(false); }}>
                    <ShoppingCart size={14} /> Add to cart
                  </button>
                  <Link href={`/product/${product.slug}`} className="btn btn-outline" style={{ borderRadius: 20 }} onClick={() => setQvOpen(false)}>
                    View details
                  </Link>
                </div>
                {product.includes.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>What&apos;s Included</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {product.includes.slice(0, 4).map((inc) => (
                        <li key={inc} style={{ display: "flex", gap: 6, fontSize: 12, color: "#242424" }}><CheckCircle2 size={12} style={{ color: "#2A74ED", marginTop: 2, flexShrink: 0 }} /> {inc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
