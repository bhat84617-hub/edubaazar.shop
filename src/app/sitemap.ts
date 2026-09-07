import type { MetadataRoute } from "next";
import { products, CATEGORIES } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";
  // Stable date - only changes when content changes, not daily
  const stableDate = "2024-12-24";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: stableDate, changeFrequency: "daily", priority: 1.0 },
    { url: base + "/shop", lastModified: stableDate, changeFrequency: "daily", priority: 0.9 },
    { url: base + "/about", lastModified: stableDate, changeFrequency: "monthly", priority: 0.7 },
    { url: base + "/contact", lastModified: stableDate, changeFrequency: "monthly", priority: 0.7 },
    { url: base + "/terms", lastModified: stableDate, changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/privacy", lastModified: stableDate, changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/refund", lastModified: stableDate, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Removed category/kind query URLs from sitemap - they are filtered views, not canonical pages
  // Google prefers sitemap to contain only canonical URLs. Category filtering is handled via navigation.

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: base + "/product/" + p.slug,
    lastModified: p.lastUpdated ? new Date(p.lastUpdated).toISOString() : new Date(p.createdAt).toISOString(),
    changeFrequency: "weekly",
    priority: p.featured ? 0.85 : p.badge === "Bestseller" ? 0.85 : p.badge === "Hot" ? 0.8 : 0.8,
    images: [`${base}${p.images[0]}`],
  }));

  return [...staticPages, ...productPages];
}
