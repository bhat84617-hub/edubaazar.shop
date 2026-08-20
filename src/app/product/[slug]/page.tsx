import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Tag } from "lucide-react";
import ProductBuy from "@/components/ProductBuy";
import ProductTabs from "@/components/ProductTabs";
import ProductCard from "@/components/ProductCard";
import { products, getProductBySlug, getRelatedProducts } from "@/lib/products";

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
    description: product.desc,
    openGraph: {
      title: `${product.title} | EduBazar.shop`,
      description: product.desc,
      images: [`https://edubaazar-shop.vercel.app${product.images[0]}`],
    },
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
    image: [`https://edubaazar-shop.vercel.app${product.images[0]}`],
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
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
                <img src={product.images[0]} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {product.images.length > 1 && (
                <div className="thumb-row">
                  {product.images.map((img, i) => (
                    <button key={i} className={i === 0 ? "active" : ""}>
                      <img src={img} alt="" />
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