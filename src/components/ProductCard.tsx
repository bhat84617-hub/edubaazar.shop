"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, Scale, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, toggleCompare, wishlist, compare, showToast, openQuickView } = useStore();
  const inWish = wishlist.includes(product.id);
  const inCmp = compare.includes(product.id);
  const free = product.price <= 0;
  const discount = !free && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const secondImage = product.images[1] ?? product.images[0];

  return (
      <article className="p-card content-product">
        <div className="p-image">
          <Link href={`/product/${product.slug}`} aria-label={product.title}>
            <Image src={product.images[0]} alt={product.title} fill sizes={CARD_SIZES} loading="lazy" className="first" />
            <Image src={secondImage} alt={`${product.title} preview`} fill sizes={CARD_SIZES} loading="lazy" className="second" />
          </Link>
          {product.badge && <span className={`p-badge onsale ${product.badge.toLowerCase()}`}>{product.badge}</span>}
          {discount > 0 && (
            <span className="p-badge" style={{ left: product.badge ? "72px" : "10px", background: "#2A74ED", color: "#fff" }}>
              -{discount}%
            </span>
          )}
          <div className="p-actions">
            <button className="p-action-btn" onClick={() => openQuickView(product.id)} aria-label="Quick view">
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
  );
}
