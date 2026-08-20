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
            <img src={product.images[0]} alt={product.title} loading="lazy" />
            {product.images[1] && (
              <img src={product.images[1]} alt="" className="second" loading="lazy" />
            )}
          </Link>
          {product.badge && <span className={`p-badge ${product.badge.toLowerCase()}`}>{product.badge}</span>}
          <div className="p-actions">
            <button className="p-action-btn" onClick={() => setQvOpen(true)} aria-label="Quick view">
              <Eye size={17} />
            </button>
            <button
              className={`p-action-btn ${inWish ? "active" : ""}`}
              onClick={() => {
                toggleWishlist(product.id);
                showToast(inWish ? "Removed from wishlist" : "Added to wishlist!");
              }}
              aria-label="Wishlist"
            >
              <Heart size={17} />
            </button>
            <button
              className={`p-action-btn ${inCmp ? "active" : ""}`}
              onClick={() => {
                toggleCompare(product.id);
                showToast(inCmp ? "Removed from compare" : "Added to compare");
              }}
              aria-label="Compare"
            >
              <Scale size={17} />
            </button>
          </div>
        </div>

        <div className="p-body">
          <span className="p-cat">{product.category}</span>
          <Link href={`/product/${product.slug}`} className="p-title">
            {product.title}
          </Link>
          <div className="p-meta">
            <span><Clock size={13} /> {product.duration}</span>
            <span><Signal size={13} /> {product.level}</span>
          </div>
          <div className="p-footer">
            <div className="p-prices">
              {!free && product.oldPrice > 0 && <span className="p-old">{formatINR(product.oldPrice)}</span>}
              <span className={`p-new ${free ? "free" : ""}`}>{free ? "FREE" : formatINR(product.price)}</span>
            </div>
            <div className="p-stars">
              <Star size={14} style={{ color: "#f5a623", fill: "#f5a623" }} />
              <span className="score">{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
          </div>
          <button
            className="btn-add"
            onClick={() => addToCart(product.id)}
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} /> Add to Cart
          </button>
        </div>
      </article>

      {/* Quick view modal */}
      <div className={`modal ${qvOpen ? "open" : ""}`} onClick={() => setQvOpen(false)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h3>Quick View</h3>
            <button className="sheet-x" onClick={() => setQvOpen(false)} aria-label="Close">
              <X size={18} />
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
                  <span><Clock size={13} /> {product.duration}</span>
                  <span><Signal size={13} /> {product.level}</span>
                  <span><Users size={13} /> {product.students} students</span>
                  <span><Star size={13} style={{ color: "#f5a623" }} /> {product.rating} ({product.reviewCount})</span>
                </div>
                <div className="qv-price-row">
                  {!free && product.oldPrice > 0 && <span className="old">{formatINR(product.oldPrice)}</span>}
                  <span className="new">{free ? "FREE" : formatINR(product.price)}</span>
                </div>
                <div className="qv-actions">
                  <button className="btn btn-primary" onClick={() => { addToCart(product.id); setQvOpen(false); }}>
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <Link href={`/product/${product.slug}`} className="btn btn-outline" onClick={() => setQvOpen(false)}>
                    View Details
                  </Link>
                </div>
                {product.includes.length > 0 && (
                  <div className="qv-includes">
                    <h4>What's Included</h4>
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