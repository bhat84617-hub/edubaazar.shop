"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/products";

const SAMPLE_REVIEWS = [
  { name: "Vikram Singh", rating: 5, text: "Excellent content. Very well explained with practical examples. Worth every rupee!" },
  { name: "Sneha Patel", rating: 4, text: "Good structured course. The downloadable resources are really helpful. Could add more quizzes." },
  { name: "Mohit Kumar", rating: 5, text: "One of the best purchases. Support team responds quickly and course access was instant." },
];

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");

  const specs: [string, string][] = [
    ["Product", product.title],
    ["Category", product.category],
    ["Level", product.level],
    ["Duration", product.duration],
    ["Students", product.students],
    ["Rating", `${product.rating} / 5`],
    ["Access", "Lifetime"],
  ];

  return (
    <div>
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "desc" ? "active" : ""}`} onClick={() => setTab("desc")}>
          Description
        </button>
        <button className={`tab-btn ${tab === "specs" ? "active" : ""}`} onClick={() => setTab("specs")}>
          Additional Info
        </button>
        <button className={`tab-btn ${tab === "reviews" ? "active" : ""}`} onClick={() => setTab("reviews")}>
          Reviews ({product.reviewCount})
        </button>
      </div>

      {tab === "desc" && (
        <div style={{ maxWidth: 780 }}>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--body)", marginBottom: 20 }}>{product.desc}</p>
          <h4 style={{ fontSize: 16, marginBottom: 12 }}>What's Included</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {product.includes.map((inc) => (
              <li key={inc} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14 }}>
                <CheckCircle2 size={16} style={{ color: "var(--primary)" }} /> {inc}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 22 }}>
            <h4 style={{ fontSize: 16, marginBottom: 10 }}>About EduBazar Access</h4>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>
              After payment, our admin team verifies your UPI transaction and approves your
              order within a few hours. Once approved, download links and course access appear
              in your dashboard. All products include lifetime access.
            </p>
          </div>
        </div>
      )}

      {tab === "specs" && (
        <table className="spec-table" style={{ maxWidth: 600 }}>
          <tbody>
            {specs.map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td style={{ fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "reviews" && (
        <div style={{ display: "grid", gap: 14, maxWidth: 780 }}>
          {SAMPLE_REVIEWS.map((r, i) => (
            <div key={i} style={{ background: "var(--soft)", borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div className="t-avatar" style={{ width: 36, height: 36 }}>{r.name[0]}</div>
                <div>
                  <strong style={{ fontSize: 14 }}>{r.name}</strong>
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={13} fill={s < r.rating ? "#f5a623" : "none"} color={s < r.rating ? "#f5a623" : "#ccc"} />
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}