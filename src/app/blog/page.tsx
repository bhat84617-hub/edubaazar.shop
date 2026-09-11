import Link from "next/link";
import type { Metadata } from "next";
import { POSTS } from "@/lib/blog";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";

export const metadata: Metadata = {
  title: "Blog — Learn Hacking, Programming & Trading | EduBazar.shop",
  description:
    "Practical guides: best Python course under ₹200, ethical hacking roadmap for beginners, free stock market course in India.",
  alternates: { canonical: `${SITE}/blog` },
};

export default function BlogIndex() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EduBazar.shop Blog",
    url: `${SITE}/blog`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: POSTS.length,
      itemListElement: POSTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };
  return (
    <div className="container" style={{ padding: "28px 16px 48px", maxWidth: 860 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#777", marginBottom: 8 }}>
        <Link href="/">Home</Link> / <span>Blog</span>
      </nav>
      <h1 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, color: "#242424" }}>EduBazar Blog</h1>
      <p style={{ color: "#777", marginTop: 6, fontSize: 14 }}>
        Practical buying guides for hacking, programming, and trading courses in India.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>
        {POSTS.map((p) => (
          <article key={p.slug} style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20, padding: 20 }}>
            <Link href={`/blog/${p.slug}`} style={{ fontSize: 17, fontWeight: 800, color: "#242424", textDecoration: "none" }}>
              {p.title}
            </Link>
            <p style={{ fontSize: 13, color: "#777", marginTop: 8, lineHeight: 1.7 }}>{p.description}</p>
            <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
              {p.date} • {p.readMins} min read
            </div>
            <Link href={`/blog/${p.slug}`} style={{ display: "inline-block", marginTop: 10, fontSize: 13, fontWeight: 700, color: "#2A74ED" }}>
              Read guide →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
