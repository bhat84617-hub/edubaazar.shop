import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POSTS, getPost } from "@/lib/blog";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: `${post.title} | EduBazar.shop`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${SITE}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE}/blog/${slug}`,
      siteName: "EduBazar.shop",
      locale: "en_IN",
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "EduBazar.shop", url: SITE },
    publisher: { "@type": "Organization", name: "EduBazar.shop", url: SITE },
    mainEntityOfPage: `${SITE}/blog/${slug}`,
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="container" style={{ padding: "28px 16px 48px", maxWidth: 800 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "#777", marginBottom: 8 }}>
        <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / <span>{post.title}</span>
      </nav>
      <h1 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, color: "#242424", lineHeight: 1.3 }}>
        {post.title}
      </h1>
      <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
        {post.date} • {post.readMins} min read • EduBazar.shop
      </p>
      {post.body.map((sec) => (
        <section key={sec.h} style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#242424" }}>{sec.h}</h2>
          {sec.p.map((para, i) => (
            <p key={i} style={{ fontSize: 14, color: "#444", lineHeight: 1.8, marginTop: 10 }}>
              {para}
            </p>
          ))}
        </section>
      ))}
      <section style={{ marginTop: 28, background: "#f8f9fb", border: "1px solid #E5E5E5", borderRadius: 20, padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#242424" }}>Recommended on EduBazar.shop</h2>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {post.products.map((pr) => (
            <li key={pr.slug}>
              <Link href={`/product/${pr.slug}`} style={{ fontSize: 14, fontWeight: 700, color: "#2A74ED" }}>
                {pr.label} →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
