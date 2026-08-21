import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://edubaazar.shop";
  const now = new Date().toISOString();

  const staticPages = [
    { url: base, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: base + "/shop", lastModified: now, changeFrequency: "daily" as const, priority: 0.9 },
    { url: base + "/about", lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: base + "/contact", lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: base + "/terms", lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: base + "/privacy", lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: base + "/refund", lastModified: now, changeFrequency: "yearly" as const, priority: 0.4 },
  ];

  const productPages = products.map((p) => ({
    url: base + "/product/" + p.slug,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
