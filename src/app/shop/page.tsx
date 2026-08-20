import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ShopControls } from "@/components/ShopControls";
import { products, CATEGORIES } from "@/lib/products";

type SearchParams = { cat?: string; q?: string; sort?: string; kind?: string };

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

  let list = [...products];

  if (cat) list = list.filter((p) => p.category.toLowerCase() === cat.toLowerCase());
  if (kind) list = list.filter((p) => p.kind === kind);
  if (q) list = list.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));

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
  const sidebarLink = (extra: Partial<SearchParams>) => buildHref(extra, { cat, q, kind, sort });

  return (
    <div>
      <div style={{ background: "var(--primary-dark)", color: "#fff", padding: "38px 0 30px" }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            <Link href="/">Home</Link>
            <ChevronRight size={13} />
            <Link href="/shop">Shop</Link>
            {cat && (
              <>
                <ChevronRight size={13} />
                <span style={{ color: "var(--accent)" }}>{cat}</span>
              </>
            )}
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,40px)" }}>
            {q ? `Results for "${sp.q}"` : cat || "All Products"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 6 }}>
            {list.length} products available
          </p>
        </div>
      </div>

      <section className="section-pad">
        <div className="container">
          <ShopControls count={list.length} />
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 26, alignItems: "start" }}>
            {/* Sidebar filters */}
            <aside className="filter-side" style={{ position: "sticky", top: 120 }}>
              <div className="filter-group">
                <h4>Categories</h4>
                <Link href={`/shop?${sidebarLink({ cat: "" })}`} className="filter-option" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span><input type="checkbox" checked={!cat} readOnly style={{ marginRight: 8 }} />All</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{products.length}</span>
                </Link>
                {CATEGORIES.map((c) => {
                  const count = products.filter((p) => p.category === c.key).length;
                  const active = cat.toLowerCase() === c.key.toLowerCase();
                  return (
                    <Link
                      key={c.key}
                      href={`/shop?${sidebarLink({ cat: c.key })}`}
                      className="filter-option"
                      style={{ display: "flex", justifyContent: "space-between", color: active ? "var(--primary)" : "var(--body)", fontWeight: active ? 700 : 400 }}
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
                      href={`/shop?${sidebarLink(kind === k ? { kind: "" } : { kind: k })}`}
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
                <Link href={`/shop?${sidebarLink({ q: "free" })}`} className="filter-option">
                  Free Products ({freeCount})
                </Link>
                <Link href={`/shop?${sidebarLink({ sort: "price_low" })}`} className="filter-option">
                  Under ₹200
                </Link>
                <Link href={`/shop?${sidebarLink({ sort: "price_high" })}`} className="filter-option">
                  Premium ₹250+
                </Link>
              </div>

              <div className="filter-group">
                <h4>Rating</h4>
                <Link href={`/shop?${sidebarLink({ sort: "rating" })}`} className="filter-option">
                  Top Rated (4.5★+) <ChevronDown size={14} style={{ marginLeft: "auto" }} />
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
                <div className="p-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
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