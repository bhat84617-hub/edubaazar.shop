import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ShopControls } from "@/components/ShopControls";
import { products, CATEGORIES, productMatchesQuery } from "@/lib/products";
import type { Metadata } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";

const baseMetadata: Metadata = {
  title: "Shop - All Courses | EduBazar.shop",
  description: "Shop all 30+ online courses at EduBazar.shop. Ethical Hacking, Programming, Python, JavaScript, Stock Market, Trading & more from ₹49. UPI payment, lifetime access.",
  keywords: ["shop courses", "buy courses online", "hacking courses India", "programming courses cheap", "stock market course", "digital marketing course", "free tools", "EduBazar shop"],
  openGraph: {
    title: "Shop All Courses — EduBazar.shop",
    description: "Browse 30+ premium courses in Hacking, Programming, Trading & more. From ₹49. Instant UPI delivery.",
    url: `${SITE}/shop`,
    type: "website",
    images: [{ url: `${SITE}/logo/edulogo.jpeg`, width: 512, height: 512, alt: "Shop EduBazar.shop" }],
  },
  twitter: { card: "summary_large_image", title: "Shop All Courses — EduBazar.shop", description: "30+ courses from ₹49. Hacking, Programming, Trading & more." },
  alternates: { canonical: `${SITE}/shop` },
};

type SearchParams = { cat?: string; q?: string; sort?: string; kind?: string; free?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const hasNonIndexableFilter = Boolean(params.q || params.sort || params.kind || params.free);
  const canonical = params.cat ? `${SITE}/shop?cat=${encodeURIComponent(params.cat)}` : `${SITE}/shop`;

  return {
    ...baseMetadata,
    alternates: { canonical },
    robots: hasNonIndexableFilter ? { index: false, follow: true } : { index: true, follow: true },
  };
}

function buildHref(extra: Partial<SearchParams>, base: SearchParams): string {
  const url = new URLSearchParams();
  const merged = { ...base, ...extra };
  Object.entries(merged).forEach(([k, v]) => {
    if (v) url.set(k, v);
  });
  return url.toString();
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const cat = sp.cat ?? "";
  const q = (sp.q ?? "").toLowerCase().trim();
  const kind = sp.kind ?? "";
  const sort = sp.sort ?? "";
  const freeOnly = sp.free === "1";

  let list = [...products];

  if (cat) list = list.filter((p) => p.category.toLowerCase() === cat.toLowerCase());
  if (kind) list = list.filter((p) => p.kind === kind);
  if (freeOnly) list = list.filter((p) => p.price <= 0);
  if (q) list = list.filter((p) => productMatchesQuery(p, q));

  switch (sort) {
    case "price_low":
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price_high":
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
  }

  const freeCount = products.filter((p) => p.price <= 0).length;
  const sidebarLink = (extra: Partial<SearchParams>) => buildHref(extra, { cat, q, kind, sort, free: freeOnly ? "1" : "" });

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat ? `${cat} Courses — EduBazar.shop` : "All Courses — EduBazar.shop",
    description: cat ? `Browse ${list.length} ${cat} products on EduBazar.shop.` : `Browse ${list.length} online courses, books, and digital products on EduBazar.shop.`,
    url: `${SITE}/shop${cat ? `?cat=${encodeURIComponent(cat)}` : ""}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: list.length,
      itemListElement: list.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/product/${p.slug}`,
        name: p.title,
      })),
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <div style={{ background: "#f8f9fb", borderBottom: "1px solid #E5E5E5", padding: "22px 0 18px" }}>
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 8 }}>
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop">Shop</Link>
            {cat && (
              <>
                <ChevronRight size={12} />
                <span style={{ color: "#2A74ED", fontWeight: 700 }}>{cat}</span>
              </>
            )}
          </div>
          <h1 style={{ color: "#242424", fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, letterSpacing: "-0.4px" }}>
            {q ? `Results for "${sp.q}"` : cat || "All Products"}
          </h1>
          <p style={{ color: "#777", marginTop: 4, fontSize: 13 }}>
            {list.length} products • Premium minimal electronics style
          </p>
        </div>
      </div>

      <section className="section-pad">
        <div className="container">
          <ShopControls count={list.length} />
          <div className="shop-layout">
            {/* Sidebar filters */}
            <aside className="filter-side">
              <div className="filter-group">
                <h4>Categories</h4>
                <Link href={`/shop`} className="filter-option" style={{ display: "flex", justifyContent: "space-between" }} aria-current={!cat ? "page" : undefined}>
                  <span>{!cat ? "✓ " : ""}All</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{products.length}</span>
                </Link>
                {CATEGORIES.map((c) => {
                  const count = products.filter((p) => p.category === c.key).length;
                  const active = cat.toLowerCase() === c.key.toLowerCase();
                  return (
                    <Link
                      key={c.key}
                      href={`/shop?cat=${encodeURIComponent(c.key)}`}
                      className="filter-option"
                      style={{ display: "flex", justifyContent: "space-between", color: active ? "var(--primary)" : "var(--body)", fontWeight: active ? 700 : 400 }}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{c.label}</span>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>{count}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="filter-group">
                <h4>Type</h4>
                {["course", "book", "tool"].map((k) => {
                  const count = products.filter((p) => p.kind === k).length;
                  const label = k === "course" ? "Courses" : k === "book" ? "Digital Books" : "Tools";
                  const active = kind === k;
                  return (
                    <Link
                      key={k}
                      href={`/shop?${sidebarLink(kind === k ? { kind: "", free: "" } : { kind: k, free: "" })}`}
                      className="filter-option"
                      style={{ color: active ? "var(--primary)" : "var(--body)", fontWeight: active ? 700 : 400 }}
                    >
                      {label}
                      <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: "auto" }}>{count}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="filter-group">
                <h4>Price</h4>
                <Link
                  href={`/shop?${sidebarLink(freeOnly ? { free: "" } : { free: "1" })}`}
                  className="filter-option"
                  style={{ color: freeOnly ? "var(--primary)" : "var(--body)", fontWeight: freeOnly ? 700 : 400 }}
                >
                  Free Products ({freeCount})
                </Link>
                <Link href={`/shop?${sidebarLink({ sort: "price_low", free: "" })}`} className="filter-option">
                  Under ₹200
                </Link>
                <Link href={`/shop?${sidebarLink({ sort: "price_high", free: "" })}`} className="filter-option">
                  Premium ₹250+
                </Link>
              </div>

              <div className="filter-group">
                <h4>Rating</h4>
                <Link href={`/shop?${sidebarLink({ sort: "rating", free: "" })}`} className="filter-option">
                  Top Rated (4.5+) <ChevronDown size={14} style={{ marginLeft: "auto" }} />
                </Link>
              </div>
            </aside>

            {/* Grid */}
            <div>
              {list.length === 0 ? (
                <div className="dash-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No products found</p>
                  <p style={{ color: "var(--muted)", marginBottom: 20 }}>Try a different search or clear filters</p>
                  <Link href="/shop" className="btn btn-primary">Reset Filters</Link>
                </div>
              ) : (
                <div className="p-grid shop-product-grid">
                  {list.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}