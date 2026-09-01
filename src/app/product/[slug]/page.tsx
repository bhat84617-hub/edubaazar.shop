import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Tag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import ProductBuy from "@/components/ProductBuy";
import ProductTabs from "@/components/ProductTabs";
import ProductCard from "@/components/ProductCard";
import { products, getProductBySlug, getRelatedProducts } from "@/lib/products";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const seoDescription = product.desc.length <= 160 ? product.desc : `${product.desc.slice(0, 157).trimEnd()}...`;
  const seoKeywords = [
    product.title,
    `${product.category} ${product.kind}`,
    `${product.level} ${product.category}`,
    ...(product.tags ?? []),
    "EduBazar",
    "online learning India",
  ];
  return {
    title: product.title,
    description: seoDescription,
    keywords: [...new Set(seoKeywords)],
    openGraph: {
      title: `${product.title} | EduBazar.shop`,
      description: seoDescription,
      url: `${SITE}/product/${slug}`,
      siteName: "EduBazar.shop",
      locale: "en_IN",
      type: "website",
      images: [{ url: `${SITE}${product.images[0]}`, width: 800, height: 600, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | EduBazar.shop`,
      description: seoDescription,
      images: [`${SITE}${product.images[0]}`],
    },
    alternates: { canonical: `${SITE}/product/${slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.fullDesc || product.desc,
    category: product.category,
    keywords: product.tags?.join(", "),
    image: [`${SITE}${product.images[0]}`],
    brand: { "@type": "Brand", name: "EduBazar.shop" },
    sku: product.slug,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${SITE}/product/${slug}`,
      itemCondition: "https://schema.org/NewCondition",
    },
    dateModified: product.lastUpdated || product.createdAt,
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

      <div style={{ background: "#f8f9fb", borderBottom: "1px solid #E5E5E5", padding: "14px 0" }}>
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 0 }}>
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop">Shop</Link>
            <ChevronRight size={12} />
            <Link href={`/shop?cat=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <ChevronRight size={12} />
            <span style={{ color: "#2A74ED", fontWeight: 600 }}>{product.title}</span>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container">
          <div className="psingle-grid">
            {/* Gallery XSTORE - border radius 20px */}
            <div>
              <div className="psingle-gallery-main woocommerce-product-gallery images-wrapper">
                <img src={product.images[0]} alt={product.title} width={800} height={600} />
              </div>
              {product.images.length > 1 && (
                <div className="thumb-row thumbnails-list">
                  {product.images.map((img, i) => (
                    <button key={i} className={i === 0 ? "active" : ""}>
                      <img src={img} alt={`${product.title} thumbnail ${i + 1}`} width={120} height={90} />
                    </button>
                  ))}
                </div>
              )}
              {product.badge && (
                <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "#eef3ff", color: "#2A74ED", padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid #d6e3ff" }}>
                  <Tag size={12} /> {product.badge} product
                </div>
              )}
              {/* XSTORE sidebar widgets below gallery on desktop */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}>
                {[
                  { icon: <Truck size={14} />, t: "Free Shipping", d: "Orders ₹500+" },
                  { icon: <RotateCcw size={14} />, t: "30 Days Return", d: "Money back" },
                  { icon: <ShieldCheck size={14} />, t: "Secure Payment", d: "UPI protected" },
                ].map((b) => (
                  <div key={b.t} className="sidebar-widget" style={{ padding: 12, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "#2A74ED" }}>{b.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#242424", textTransform: "uppercase" }}>{b.t}</span>
                    <span style={{ fontSize: 10, color: "#777" }}>{b.d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20, padding: 20 }}>
              <span className="qv-cat">{product.category}</span>
              <h1 style={{ fontSize: "clamp(20px,2.6vw,26px)", lineHeight: 1.2, margin: "10px 0 8px", color: "#242424", fontWeight: 800, letterSpacing: "-0.4px" }}>
                {product.title}
              </h1>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 16 }}>
                {product.desc}
              </p>
              <ProductBuy product={product} />
            </div>
          </div>

          {/* Tabs XSTORE pill active bg #2A74ED */}
          <div style={{ marginTop: 28, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20, padding: 20 }}>
            <ProductTabs product={product} />
          </div>

          {/* FAQ Section rounded */}
          <div style={{ marginTop: 20, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20, padding: 20 }}>
            <h2 style={{ fontSize: 16, marginBottom: 14, fontWeight: 800, color: "#242424" }}>Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { q: `What is included in ${product.title}?`, a: product.includes?.join(". ") || `This course includes comprehensive content on ${product.category}.` },
                { q: "How long does access last?", a: "You get lifetime access. Once purchased, you can study anytime, anywhere on any device." },
                { q: "How do I pay?", a: "We accept UPI payments via Google Pay, PhonePe, Paytm, or any UPI app. After payment, enter your transaction ID and our team will verify it within 24 hours." },
                { q: "Will I get a certificate?", a: "Yes! You receive a certificate of completion after finishing the course content." },
              ].map((faq, i) => (
                <details key={i} style={{ background: "#f8f9fb", border: "1px solid #E5E5E5", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
                  <summary style={{ fontWeight: 700, fontSize: 12, color: "#242424", listStyle: "none" }}>{faq.q}</summary>
                  <p style={{ marginTop: 8, fontSize: 12, color: "#777", lineHeight: 1.7 }}>{faq.a}</p>
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
                <div key={p.id} className="product-slide"><ProductCard product={p} /></div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
