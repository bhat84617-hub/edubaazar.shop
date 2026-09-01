"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, Scale, ShoppingCart, Clock, Signal, Star, X, Users, CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, toggleCompare, wishlist, compare, showToast } = useStore();
  const [qvOpen, setQvOpen] = useState(false);
  const inWish = wishlist.includes(product.id);
  const inCmp = compare.includes(product.id);
  const free = product.price <= 0;

  return (
    <>
      <article className="p-card">
        <div className="p-image">
          <Link href={`/product/${product.slug}`}>
            <img src={product.images[0]} alt={product.title} loading="lazy" className="first" />
            {product.images[1] ? (
              <img src={product.images[1]} alt={`${product.title} preview`} className="second" loading="lazy" />
            ) : (
              <img src={product.images[0]} alt={`${product.title} preview`} className="second" loading="lazy" />
            )}
          </Link>
          {product.badge && <span className={`p-badge ${product.badge.toLowerCase()}`}>{product.badge}</span>}
          {product.price > 0 && product.oldPrice > product.price && (
            <span className="p-badge" style={{ left: product.badge ? "68px" : "10px", background: "#fbbc34", color: "#333" }}>
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          )}
          <div className="p-actions">
            <button className="p-action-btn" onClick={() => setQvOpen(true)} aria-label="Quick view">
              <Eye size={16} />
            </button>
            <button
              className={`p-action-btn ${inWish ? "active" : ""}`}
              onClick={() => {
                toggleWishlist(product.id);
                showToast(inWish ? "Removed from wishlist" : "Added to wishlist!");
              }}
              aria-label="Wishlist"
            >
              <Heart size={16} fill={inWish ? "currentColor" : "none"} />
            </button>
            <button
              className={`p-action-btn ${inCmp ? "active" : ""}`}
              onClick={() => {
                toggleCompare(product.id);
                showToast(inCmp ? "Removed from compare" : "Added to compare");
              }}
              aria-label="Compare"
            >
              <Scale size={16} />
            </button>
          </div>
        </div>

        <div className="p-body">
          <span className="p-cat">{product.category}</span>
          <Link href={`/product/${product.slug}`} className="p-title">
            {product.title}
          </Link>
          <div className="p-stars" style={{ fontSize: 11 }}>
            <span style={{ display: "flex", gap: 1 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} fill={i < Math.round(product.rating) ? "#fbbc34" : "none"} color={i < Math.round(product.rating) ? "#fbbc34" : "#ddd"} />
              ))}
            </span>
            <span style={{ color: "#777", fontSize: 11 }}>({product.reviewCount})</span>
          </div>
          <div className="p-footer">
            <div className="p-prices">
              {!free && product.oldPrice > 0 && <span className="p-old">{formatINR(product.oldPrice)}</span>}
              <span className={`p-new ${free ? "free" : ""}`}>{free ? "FREE" : formatINR(product.price)}</span>
            </div>
          </div>
          <div className="p-meta" style={{ display: "none" }}>
            <span><Clock size={11} /> {product.duration}</span>
            <span><Signal size={11} /> {product.level}</span>
          </div>
          <button
            className="btn-add"
            onClick={() => addToCart(product.id)}
            aria-label="Add to cart"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </article>

      {/* Quick view modal */}
      <div className={`modal ${qvOpen ? "open" : ""}`} onClick={() => setQvOpen(false)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h3>Quick View</h3>
            <button className="sheet-x" onClick={() => setQvOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <div className="modal-body">
            <div className="qv-grid">
              <div className="qv-img">
                <img src={product.images[0]} alt={product.title} />
              </div>
              <div>
                <span className="qv-cat">{product.category}</span>
                <h3 className="qv-title">{product.title}</h3>
                <p className="qv-desc">{product.desc}</p>
                <div className="qv-meta">
                  <span><Clock size={12} /> {product.duration}</span>
                  <span><Signal size={12} /> {product.level}</span>
                  <span><Users size={12} /> {product.students} students</span>
                  <span><Star size={12} style={{ color: "#fbbc34" }} /> {product.rating} ({product.reviewCount})</span>
                </div>
                <div className="qv-price-row">
                  {!free && product.oldPrice > 0 && <span className="old">{formatINR(product.oldPrice)}</span>}
                  <span className="new">{free ? "FREE" : formatINR(product.price)}</span>
                </div>
                <div className="qv-actions">
                  <button className="btn btn-primary" onClick={() => { addToCart(product.id); setQvOpen(false); }}>
                    <ShoppingCart size={15} /> Add to Cart
                  </button>
                  <Link href={`/product/${product.slug}`} className="btn btn-outline" onClick={() => setQvOpen(false)}>
                    View Details
                  </Link>
                </div>
                {product.includes.length > 0 && (
                  <div className="qv-includes">
                    <h4>What&apos;s Included</h4>
                    <ul>
                      {product.includes.slice(0, 4).map((inc) => (
                        <li key={inc}><CheckCircle2 size={13} /> {inc}</li>
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
