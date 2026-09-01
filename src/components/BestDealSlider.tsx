"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { formatINR } from "@/lib/products";

const DEAL_SLUGS = [
  "ultimate-facebook-ads-course-2025",
  "seo-masterclass-onpage-offpage-technical",
  "dedsec-antivirus-evasion-course",
  "complete-windows-password-cracking",
  "kali-linux-for-ethical-hackers",
  "learn-shopify-now-beginners",
  "telegram-bot-course-python",
  "master-website-creation-15-platforms",
];

const dealProducts = DEAL_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean) as typeof products;

const OFFERS: Record<string, { badge: string; discount: string }> = {
  "ultimate-facebook-ads-course-2025": { badge: "Hot Deal", discount: "52% OFF" },
  "seo-masterclass-onpage-offpage-technical": { badge: "Bestseller", discount: "49% OFF" },
  "dedsec-antivirus-evasion-course": { badge: "Limited", discount: "58% OFF" },
  "complete-windows-password-cracking": { badge: "Trending", discount: "50% OFF" },
  "kali-linux-for-ethical-hackers": { badge: "New", discount: "48% OFF" },
  "learn-shopify-now-beginners": { badge: "Bestseller", discount: "45% OFF" },
  "telegram-bot-course-python": { badge: "Hot", discount: "46% OFF" },
  "master-website-creation-15-platforms": { badge: "Bundle", discount: "62% OFF" },
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

      <div className="ws-deal-viewport">
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
      </div>
    </section>
  );
}
