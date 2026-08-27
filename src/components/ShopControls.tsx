"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function ShopControls({ count }: { count: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const sort = params.get("sort") ?? "";

  const setParam = (key: string, value: string) => {
    const url = new URLSearchParams(params.toString());
    if (value) url.set(key, value);
    else url.delete(key);
    router.push(`/shop?${url.toString()}`);
  };

  return (
    <div className="dash-panel" style={{ marginBottom: 22, padding: "14px 18px" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div className="header-search" style={{ flex: 1, minWidth: 200, background: "var(--soft)" }}>
          <input
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setParam("q", q.trim())}
          />
          <button onClick={() => setParam("q", q.trim())} aria-label="Search">
            <Search size={16} />
          </button>
        </div>
        <select
          className="dash-search"
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          aria-label="Sort by"
        >
          <option value="">Sort by: Default</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="rating">Top Rated</option>
        </select>
        <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
          <SlidersHorizontal size={14} style={{ verticalAlign: "-2px" }} /> {count} products
        </span>
      </div>
    </div>
  );
}