"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/products";

const REVIEWS_BY_ID: Record<string, { name: string; rating: number; text: string }[]> = {
  h1: [
    { name: "CyberSec Student", rating: 5, text: "Best hacking course I've found. The Kali Linux labs were incredibly practical. Worth every penny." },
    { name: "Network Admin", rating: 5, text: "Already working in IT but this course filled gaps in my penetration testing skills. The Nmap and Metasploit sections are gold." },
    { name: "Security Enthusiast", rating: 4, text: "Great content for the price. The 35+ labs give real hands-on experience. Could use more mobile hacking content." },
  ],
  h2: [
    { name: "Web Developer", rating: 5, text: "Learned SQL injection and XSS in depth. The Burp Suite walkthroughs are excellent." },
    { name: "Bug Bounty Hunter", rating: 5, text: "The bug bounty methodology section helped me find my first valid vulnerability. Highly recommend!" },
    { name: "IT Student", rating: 4, text: "Solid web security course. The OWASP Top 10 coverage is thorough. Good for beginners and intermediates." },
  ],
  p1: [
    { name: "Career Switcher", rating: 5, text: "Switched from non-tech to Python developer in 3 months. The projects section is amazing." },
    { name: "Data Analyst", rating: 5, text: "The NumPy and Pandas sections are exactly what I needed for my job. Very well explained." },
    { name: "College Student", rating: 5, text: "Best Python course at this price. 200+ exercises kept me engaged throughout." },
  ],
  p2: [
    { name: "Frontend Developer", rating: 5, text: "Finally understood closures and async/await properly. The 15 projects are real-world applicable." },
    { name: "React Developer", rating: 5, text: "Great refresher on modern JS. The ES6+ section updated my skills significantly." },
    { name: "Bootcamp Graduate", rating: 4, text: "Fills the gaps that bootcamps leave. The event loop and prototypes sections are must-watch." },
  ],
  t1: [
    { name: "New Investor", rating: 5, text: "Started investing after this course. The technical analysis section is easy to follow." },
    { name: "SIP Investor", rating: 4, text: "Good overview of the Indian stock market. The risk management section is crucial for beginners." },
    { name: "Finance Student", rating: 5, text: "Practical and beginner-friendly. Live trading sessions made concepts crystal clear." },
  ],
};

const DEFAULT_REVIEWS = [
  { name: "Verified Student", rating: 5, text: "Excellent course content. Well-structured and easy to follow. The practical exercises really helped me understand the concepts." },
  { name: "Working Professional", rating: 5, text: "Great value for the price. The downloadable resources are a nice bonus. Support team is responsive too." },
  { name: "Self-Learner", rating: 4, text: "Solid course with good explanations. Lifetime access means I can revisit topics whenever I need to." },
];

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const reviews = REVIEWS_BY_ID[product.id] || DEFAULT_REVIEWS;

  const specs: [string, string][] = [
    ["Product", product.title],
    ["Category", product.category],
    ["Level", product.level],
    ["Duration", product.duration],
    ["Students", product.students],
    ["Rating", `${product.rating} / 5`],
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
          Reviews ({product.reviewCount})
        </button>
      </div>

      {tab === "desc" && (
        <div style={{ maxWidth: 780 }}>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--body)", marginBottom: 20 }}>{product.fullDesc || product.desc}</p>
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
        <div style={{ display: "grid", gap: 14, maxWidth: 780 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: "var(--soft)", borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div className="t-avatar" style={{ width: 36, height: 36 }}>{r.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)}</div>
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
