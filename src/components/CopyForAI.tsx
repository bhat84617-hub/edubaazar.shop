"use client";

import { useState } from "react";

type Props = {
  title: string;
  price: number;
  category: string;
  url: string;
  description: string;
};

export default function CopyForAI({ title, price, category, url, description }: Props) {
  const [copied, setCopied] = useState(false);

  const priceLabel = price <= 0 ? "FREE" : `₹${price}`;
  const markdown = `[${title}](${url}): ${category} — ${priceLabel}. ${description}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${title} details for AI`}
        style={{
          border: "1px solid #d6e3ff",
          background: copied ? "#2A74ED" : "#eef3ff",
          color: copied ? "#fff" : "#2A74ED",
          padding: "8px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {copied ? "Copied for AI ✓" : "Copy for AI"}
      </button>
      <a
        href="/llms.txt"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 12, color: "#777", textDecoration: "underline" }}
      >
        Raw AI view (llms.txt)
      </a>
    </div>
  );
}
