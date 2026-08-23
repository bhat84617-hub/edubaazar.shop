import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.edubaazar.shop";

  const staticPages = [
    { url: base, lastModified: "2026-08-23", changeFrequency: "weekly" as const, priority: 1.0 },
    { url: base + "/shop", lastModified: "2026-08-23", changeFrequency: "daily" as const, priority: 0.9 },
    { url: base + "/about", lastModified: "2026-08-23", changeFrequency: "monthly" as const, priority: 0.7 },
    { url: base + "/contact", lastModified: "2026-08-23", changeFrequency: "monthly" as const, priority: 0.7 },
    { url: base + "/terms", lastModified: "2026-08-23", changeFrequency: "yearly" as const, priority: 0.3 },
    { url: base + "/privacy", lastModified: "2026-08-23", changeFrequency: "yearly" as const, priority: 0.3 },
    { url: base + "/refund", lastModified: "2026-08-23", changeFrequency: "yearly" as const, priority: 0.4 },
  ];

  const productPages = products.map((p) => ({
    url: base + "/product/" + p.slug,
    lastModified: p.lastUpdated || p.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
