import type { MetadataRoute } from "next";
import { products, CATEGORIES } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";
  const now = new Date().toISOString().split("T")[0];

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: base + "/shop", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: base + "/about", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: base + "/contact", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: base + "/terms", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/privacy", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/refund", lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/shop?cat=${encodeURIComponent(c.key)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const kindPages: MetadataRoute.Sitemap = [
    { url: base + "/shop?kind=course", lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: base + "/shop?kind=book", lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: base + "/shop?kind=tool", lastModified: now, changeFrequency: "weekly", priority: 0.65 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: base + "/product/" + p.slug,
    lastModified: p.lastUpdated ? new Date(p.lastUpdated).toISOString() : new Date(p.createdAt).toISOString(),
    changeFrequency: "weekly",
    priority: p.featured ? 0.85 : p.badge === "Bestseller" ? 0.85 : p.badge === "Hot" ? 0.8 : 0.8,
    images: [`${base}${p.images[0]}`],
  }));

  return [...staticPages, ...categoryPages, ...kindPages, ...productPages];
}
