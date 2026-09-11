"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Star, Users, CheckCircle2, Clock, Signal } from "lucide-react";
import { getProductById, formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function QuickViewModal() {
  const { quickViewId, closeQuickView, addToCart } = useStore();
  const product = quickViewId ? getProductById(quickViewId) : undefined;
  const free = (product?.price ?? 0) <= 0;

  return (
    <div className={`modal ${product ? "open" : ""}`} onClick={closeQuickView} aria-hidden={!product}>
      {product && (
        <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Quick view ${product.title}`}>
          <div className="modal-head">
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Quick View</h3>
            <button className="sheet-x" onClick={closeQuickView} aria-label="Close">
              <X size={14} />
            </button>
          </div>
          <div className="modal-body">
            <div className="qv-grid">
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 16, padding: 5, background: "#f8f9fb" }}>
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={600}
                  height={600}
                  sizes="(max-width: 640px) 90vw, 400px"
                  style={{ width: "100%", borderRadius: 12, aspectRatio: "1", objectFit: "cover" }}
                />
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
                  <button className="btn btn-primary" style={{ borderRadius: 20, flex: 1 }} onClick={() => { addToCart(product.id); closeQuickView(); }}>
                    <ShoppingCart size={14} /> Add to cart
                  </button>
                  <Link href={`/product/${product.slug}`} className="btn btn-outline" style={{ borderRadius: 20 }} onClick={closeQuickView}>
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
      )}
    </div>
  );
}
