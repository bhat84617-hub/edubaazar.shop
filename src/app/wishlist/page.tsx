"use client";

import Link from "next/link";
import { Heart, ShoppingCart, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getProductById } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const items = wishlist.map(getProductById).filter(Boolean);

  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Saved</span>
          <h2>My Wishlist</h2>
          <p>{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
        </div>

        {items.length === 0 ? (
          <div className="dash-panel" style={{ textAlign: "center", padding: "70px 20px" }}>
            <Heart size={52} style={{ color: "var(--line)", marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>Your wishlist is empty</h3>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>
              Save products you love and buy them later!
            </p>
            <Link href="/shop" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="p-grid">
              {items.map((p) =>
                p ? (
                  <div key={p.id} style={{ position: "relative" }}>
                    <ProductCard product={p} />
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => addToCart(p.id)}>
                        <ShoppingCart size={14} /> Move to Cart
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleWishlist(p.id)}>
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}