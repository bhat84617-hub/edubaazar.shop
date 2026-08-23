import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Tag } from "lucide-react";
import ProductBuy from "@/components/ProductBuy";
import ProductTabs from "@/components/ProductTabs";
import ProductCard from "@/components/ProductCard";
import { products, getProductBySlug, getRelatedProducts } from "@/lib/products";

const SITE = "https://edubaazar.shop";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.fullDesc || product.desc,
    keywords: [product.title, product.category + " course", "buy " + product.title, "EduBazar " + product.category, product.category + " online course India"],
    openGraph: {
      title: `${product.title} | EduBazar.shop`,
      description: product.desc,
      url: `${SITE}/product/${slug}`,
      siteName: "EduBazar.shop",
      locale: "en_IN",
      type: "website",
      images: [{ url: `https://edubaazar.shop${product.images[0]}`, width: 800, height: 600, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | EduBazar.shop`,
      description: product.desc,
      images: [`https://edubaazar.shop${product.images[0]}`],
    },
    alternates: { canonical: `${SITE}/product/${slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);
  const free = product.price <= 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.desc,
    image: [`https://edubaazar.shop${product.images[0]}`],
    brand: { "@type": "Brand", name: "EduBazar.shop" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: parseInt(product.reviewCount.replace(/,/g, "")) || 10,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${SITE}/product/${slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE}/shop` },
      { "@type": "ListItem", position: 3, name: product.category, item: `${SITE}/shop?cat=${encodeURIComponent(product.category)}` },
      { "@type": "ListItem", position: 4, name: product.title, item: `${SITE}/product/${slug}` },
    ],
  };

  const courseLd = product.kind === "course" ? {
    "@context": "https://schema.org",
    "@type": "Course",
    name: product.title,
    description: product.fullDesc || product.desc,
    provider: { "@type": "Organization", name: "EduBazar.shop", url: SITE },
    educationalLevel: product.level,
    timeRequired: product.duration,
    numberOfCredits: 1,
    inLanguage: product.language || "en",
    offers: { "@type": "Offer", price: product.price, priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${SITE}/product/${slug}` },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: parseInt(product.reviewCount.replace(/,/g, "")) || 10 },
    ...(product.instructor ? { instructor: { "@type": "Person", name: product.instructor } } : {}),
  } : null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is included in ${product.title}?`,
        acceptedAnswer: { "@type": "Answer", text: product.includes?.join(". ") || `This course includes comprehensive content on ${product.category}.` },
      },
      {
        "@type": "Question",
        name: `How long does access last for ${product.title}?`,
        acceptedAnswer: { "@type": "Answer", text: "You get lifetime access. Once purchased, you can study anytime, anywhere." },
      },
      {
        "@type": "Question",
        name: "How do I pay for this course?",
        acceptedAnswer: { "@type": "Answer", text: "We accept UPI payments via Google Pay, PhonePe, Paytm, or any UPI app. After payment, enter your transaction ID and admin will verify it." },
      },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {courseLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div style={{ background: "var(--cream)", borderBottom: "1px solid var(--line)", padding: "18px 0" }}>
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 0 }}>
            <Link href="/">Home</Link>
            <ChevronRight size={13} />
            <Link href="/shop">Shop</Link>
            <ChevronRight size={13} />
            <Link href={`/shop?cat=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <ChevronRight size={13} />
            <span style={{ color: "var(--primary)" }}>{product.title}</span>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container">
          <div className="psingle-grid">
            {/* Gallery */}
            <div>
              <div
                style={{
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  aspectRatio: "4/3",
                  background: "var(--soft)",
                  boxShadow: "var(--shadow)",
                }}
              >
                <img src={product.images[0]} alt={product.title} width={800} height={600} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {product.images.length > 1 && (
                <div className="thumb-row">
                  {product.images.map((img, i) => (
                    <button key={i} className={i === 0 ? "active" : ""}>
                      <img src={img} alt={`${product.title} thumbnail ${i + 1}`} width={120} height={90} />
                    </button>
                  ))}
                </div>
              )}
              {product.badge && (
                <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(17,70,57,0.08)", color: "var(--primary)", padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                  <Tag size={14} /> {product.badge} product
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="qv-cat">{product.category}</span>
              <h1 style={{ fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.2, margin: "10px 0 8px" }}>
                {product.title}
              </h1>
              <p style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 18 }}>
                {product.desc}
              </p>
              <ProductBuy product={product} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginTop: 54 }}>
            <ProductTabs product={product} />
          </div>

          {/* FAQ Section */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { q: `What is included in ${product.title}?`, a: product.includes?.join(". ") || `This course includes comprehensive content on ${product.category}.` },
                { q: "How long does access last?", a: "You get lifetime access. Once purchased, you can study anytime, anywhere on any device." },
                { q: "How do I pay?", a: "We accept UPI payments via Google Pay, PhonePe, Paytm, or any UPI app. After payment, enter your transaction ID and our team will verify it within 24 hours." },
                { q: "Will I get a certificate?", a: "Yes! You receive a certificate of completion after finishing the course content." },
              ].map((faq, i) => (
                <details key={i} style={{ background: "var(--soft)", borderRadius: 8, padding: "16px 20px", cursor: "pointer" }}>
                  <summary style={{ fontWeight: 600, fontSize: 14.5, color: "var(--body)", listStyle: "none" }}>{faq.q}</summary>
                  <p style={{ marginTop: 10, fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <span className="section-tag">Related</span>
              <h2>You May Also Like</h2>
            </div>
            <div className="p-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}