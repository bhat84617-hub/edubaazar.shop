"use client";

import Link from "next/link";
import { Scale, X, ShoppingCart } from "lucide-react";
import { getProductById, formatINR } from "@/lib/products";
import { useStore } from "@/lib/store";

const ROWS: { label: string; key: string }[] = [
  { label: "Image", key: "image" },
  { label: "Category", key: "cat" },
  { label: "Level", key: "level" },
  { label: "Duration", key: "duration" },
  { label: "Students", key: "students" },
  { label: "Rating", key: "rating" },
  { label: "Price", key: "price" },
  { label: "Action", key: "action" },
];

export default function ComparePage() {
  const { compare, toggleCompare, addToCart } = useStore();
  const items = compare.map(getProductById).filter(Boolean);

  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Compare</span>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "#242424" }}>Compare Products</h1>
          <p>Compare side-by-side and pick your favourite</p>
        </div>

        {items.length === 0 ? (
          <div className="dash-panel" style={{ textAlign: "center", padding: "70px 20px" }}>
            <Scale size={52} style={{ color: "var(--line)", marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>Nothing to compare</h3>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>
              Add 2–4 products to compare them side by side.
            </p>
            <Link href="/shop" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="dash-panel" style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Detail</th>
                  {items.map((p) => p && <th key={p.id} style={{ minWidth: 190 }}>{p.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key}>
                    <td style={{ fontWeight: 700, color: "var(--muted)" }}>{row.label}</td>
                    {items.map((p) => {
                      if (!p) return null;
                      switch (row.key) {
                        case "image":
                          return (
                            <td key={p.id}>
                              <Link href={`/product/${p.slug}`}>
                                <img src={p.images[0]} alt={p.title} style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 10 }} />
                              </Link>
                            </td>
                          );
                        case "cat":
                          return <td key={p.id}>{p.category}</td>;
                        case "level":
                          return <td key={p.id}>{p.level}</td>;
                        case "duration":
                          return <td key={p.id}>{p.duration}</td>;
                        case "students":
                          return <td key={p.id}>{p.students}</td>;
                        case "rating":
                          return <td key={p.id}>★ {p.rating}</td>;
                        case "price":
                          return (
                            <td key={p.id} style={{ fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-heading)" }}>
                              {p.price <= 0 ? "FREE" : formatINR(p.price)}
                            </td>
                          );
                        case "action":
                          return (
                            <td key={p.id}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <button className="btn btn-primary btn-sm" onClick={() => addToCart(p.id)}>
                                  <ShoppingCart size={14} /> Add to Cart
                                </button>
                                <button className="btn btn-outline btn-sm" onClick={() => toggleCompare(p.id)}>
                                  <X size={14} /> Remove
                                </button>
                              </div>
                            </td>
                          );
                        default:
                          return null;
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}