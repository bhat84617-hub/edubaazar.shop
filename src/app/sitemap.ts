import type { MetadataRoute } from "next";
import { products, isSensitiveProduct } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";
  const today = new Date().toISOString().split("T")[0];

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: today, changeFrequency: "daily", priority: 1.0 },
    { url: base + "/shop", lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: base + "/blog", lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: base + "/about", lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: base + "/contact", lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: base + "/terms", lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/privacy", lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/refund", lastModified: today, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Removed category/kind query URLs from sitemap - they are filtered views, not canonical pages
  // Google prefers sitemap to contain only canonical URLs. Category filtering is handled via navigation.
  // Sensitive dual-use products are excluded (they are noindex).

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => !isSensitiveProduct(p.slug))
    .map((p) => ({
      url: base + "/product/" + p.slug,
      lastModified: p.lastUpdated ? new Date(p.lastUpdated).toISOString() : new Date(p.createdAt).toISOString(),
      changeFrequency: "weekly",
      priority: p.featured ? 0.85 : p.badge === "Bestseller" ? 0.85 : p.badge === "Hot" ? 0.8 : 0.8,
      images: [encodeURI(`${base}${p.images[0]}`)],
    }));

  return [...staticPages, ...productPages];
}
