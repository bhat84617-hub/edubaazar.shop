"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { formatINR } from "@/lib/products";

const DEAL_SLUGS = [
  "888rat-remote-access-tool",
  "digital-marketing-masterclass",
  "stock-market-mastery-zero-to-pro",
  "dedsec-facebook-instagram-hacking",
];

const dealProducts = DEAL_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean) as typeof products;

const OFFERS: Record<string, { badge: string; discount: string }> = {
  "888rat-remote-access-tool": { badge: "Hot Deal", discount: "60% OFF" },
  "digital-marketing-masterclass": { badge: "Bestseller", discount: "50% OFF" },
  "stock-market-mastery-zero-to-pro": { badge: "Trending", discount: "45% OFF" },
  "dedsec-facebook-instagram-hacking": { badge: "Limited", discount: "55% OFF" },
};

export default function BestDealSlider() {
  const doubled = [...dealProducts, ...dealProducts];

  return (
    <section className="ws-deal-section">
      <div className="container">
        <div className="ws-deal-head">
          <span className="ws-section-tag">Limited Time</span>
          <h2>Best Deals</h2>
          <div className="ws-divider" style={{ margin: "0 auto" }} />
          <p style={{ marginTop: 12 }}>Grab these offers before they expire</p>
        </div>
      </div>

      <div className="ws-deal-track">
        {doubled.map((p, i) => {
          const offer = OFFERS[p.slug];
          const free = p.price <= 0;
          return (
            <div key={`${p.id}-${i}`} className="ws-deal-card">
              <div className="ws-deal-img">
                <Link href={`/product/${p.slug}`}>
                  <img src={p.images[0]} alt={p.title} loading="lazy" />
                </Link>
                {offer && <span className="ws-deal-badge">{offer.badge}</span>}
              </div>
              <div className="ws-deal-body">
                <span className="ws-deal-cat">{p.category}</span>
                <Link href={`/product/${p.slug}`} className="ws-deal-title">
                  {p.title}
                </Link>
                <div className="ws-deal-prices">
                  {!free && p.oldPrice > 0 && <span className="ws-deal-old">{formatINR(p.oldPrice)}</span>}
                  {free ? (
                    <span className="ws-deal-free">FREE</span>
                  ) : (
                    <span className="ws-deal-new">{formatINR(p.price)}</span>
                  )}
                  {offer && <span style={{ color: "#e04f4f", fontSize: 12, fontWeight: 600 }}>{offer.discount}</span>}
                </div>
                <Link href={`/product/${p.slug}`} className="ws-deal-btn">
                  Shop Now <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
