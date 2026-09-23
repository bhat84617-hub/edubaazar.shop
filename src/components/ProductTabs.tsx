"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";
import type { Product } from "@/lib/products";

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");

  const specs: [string, string][] = [
    ["Product", product.title],
    ["Category", product.category],
    ["Level", product.level],
    ["Duration", product.duration],
    ["Students", product.students],
    ["Access", "Lifetime"],
    ...(product.instructor ? [["Instructor", product.instructor]] as [string, string][] : []),
    ...(product.language ? [["Language", product.language]] as [string, string][] : []),
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
          Reviews
        </button>
      </div>

      {tab === "desc" && (
        <div style={{ maxWidth: 780 }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--body)", marginBottom: 20 }}>{product.fullDesc || product.desc}</p>
          <h4 style={{ fontSize: 16, marginBottom: 12 }}>What&apos;s Included</h4>
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
        <div
          style={{
            maxWidth: 780,
            background: "var(--soft)",
            borderRadius: 12,
            padding: "28px 20px",
            textAlign: "center",
          }}
        >
          <MessageSquare size={28} style={{ color: "var(--primary)", margin: "0 auto 10px" }} />
          <h4 style={{ fontSize: 15, marginBottom: 6 }}>No reviews yet</h4>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
            Be the first to review this product after purchase. Verified buyer reviews will
            appear here — we only publish real feedback from actual customers.
          </p>
        </div>
      )}
    </div>
  );
}
