"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search, Heart, ShoppingBag, User, ChevronDown, Trash2, LayoutGrid, Scale } from "lucide-react";
import { useStore } from "@/lib/store";
import { getProductById, searchProducts, formatINR, CATEGORIES } from "@/lib/products";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, cartSubtotal, cart, wishlist, compare, user, removeFromCart, mounted } = useStore();

  const [searchCat, setSearchCat] = useState("All categories");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchProducts>>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"menu" | "categories">("menu");
  const [scrolled, setScrolled] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchProducts(query));
  }, [query]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setResults([]);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const doSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    const catParam = searchCat !== "All categories" ? `&cat=${encodeURIComponent(searchCat)}` : "";
    router.push(`/shop?q=${encodeURIComponent(term)}${catParam}`);
    setQuery("");
    setResults([]);
    setDrawerOpen(false);
  };

  const isActive = (href: string) => pathname === href;

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* XStore Minimal Electronics - minimal white sticky header */}
      <header className={`ws-header etheme-elementor-header-sticky ${scrolled ? "ws-header-scrolled" : ""}`}>
        <div className="ws-header-inner container">
          <button className="ws-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <Menu size={20} strokeWidth={1.7} />
          </button>

          {/* Logo left 238x46 */}
          <Link href="/" className="ws-logo">
            <img src="/logo/edulogo.jpeg" alt="EduBazar" />
            <span className="ws-logo-text">EduBazar<span>.shop</span></span>
          </Link>

          {/* Nav center (desktop) */}
          <nav className="ws-header-nav-center" aria-label="Primary">
            <Link href="/" className={isActive("/") ? "active" : ""}>Home</Link>
            <Link href="/shop" className={pathname.startsWith("/shop") ? "active" : ""}>Shop</Link>
            <Link href="/shop?cat=Hacking" className={pathname.includes("cat=Hacking") ? "active" : ""}>Hacking</Link>
            <Link href="/shop?cat=Programming" className={pathname.includes("cat=Programming") ? "active" : ""}>Programming</Link>
            <Link href="/about" className={isActive("/about") ? "active" : ""}>About</Link>
            <Link href="/contact" className={isActive("/contact") ? "active" : ""}>Contact</Link>
          </nav>

          {/* Search center pill */}
          <div className="ws-search-bar" ref={searchRef} style={{ margin: "0 12px" }}>
            <div className="ws-search-bar-cat">
              <select value={searchCat} onChange={(e) => setSearchCat(e.target.value)} aria-label="Category">
                <option>All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={13} style={{ marginLeft: -10, pointerEvents: "none", color: "#777" }} />
            </div>
            <input
              className="ws-search-bar-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="Search for products"
            />
            <button className="ws-search-bar-btn" onClick={() => doSearch()} aria-label="Search">
              <Search size={16} strokeWidth={2} />
            </button>
            {query && results.length > 0 && (
              <div className="ws-search-results-dropdown">
                {results.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="ws-search-item"
                    onClick={() => {
                      router.push(`/product/${p.slug}`);
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    <img src={p.images[0]} alt={p.title} />
                    <div className="ws-search-content">
                      <h4>{p.title}</h4>
                      <p>{p.category} • {formatINR(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right tools - et_cart-type-4 minimal */}
          <div className="ws-header-right">
            <button className="ws-icon-btn" aria-label="Search" onClick={() => setDrawerOpen(true)} style={{ display: "none" }} id="mobile-search-btn">
              <Search size={17} strokeWidth={1.8} />
            </button>

            <Link href="/compare" className="ws-icon-btn" aria-label="Compare">
              <Scale size={17} strokeWidth={1.7} />
              {mounted && compare.length > 0 && <span className="ws-badge">{compare.length}</span>}
            </Link>

            <Link href="/wishlist" className="ws-icon-btn" aria-label="Wishlist">
              <Heart size={17} strokeWidth={1.7} />
              {mounted && wishlist.length > 0 && <span className="ws-badge">{wishlist.length}</span>}
            </Link>

            <Link href={mounted && user ? "/account" : "/login"} className="ws-icon-btn" aria-label="Account">
              <User size={17} strokeWidth={1.7} />
            </Link>

            <div className="ws-cart-wrap">
              <Link href="/cart" className="ws-icon-btn ws-tools-cart et_cart-type-4" aria-label="Cart">
                <ShoppingBag size={17} strokeWidth={1.7} />
                {mounted && cartCount > 0 && <span className="ws-badge">{cartCount}</span>}
              </Link>
              <div className="ws-mini-cart">
                <div className="ws-mini-cart-head">Shopping cart {mounted && `(${cartCount})`}</div>
                {mounted && cart.length === 0 ? (
                  <div className="ws-mini-cart-empty">Your cart is empty.</div>
                ) : (
                  <>
                    {mounted && cart.slice(0, 3).map((item) => {
                      const p = getProductById(item.id);
                      if (!p) return null;
                      return (
                        <div key={item.id} className="ws-mini-cart-item">
                          <img src={p.images[0]} alt={p.title} />
                          <div className="ws-mini-cart-info">
                            <h5>{p.title}</h5>
                            <p>{formatINR(p.price)} × {item.qty}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} aria-label="Remove"><Trash2 size={13} /></button>
                        </div>
                      );
                    })}
                    <div className="ws-mini-cart-foot">
                      <div className="ws-mini-cart-total">
                        <span>Subtotal</span>
                        <strong>{formatINR(cartSubtotal)}</strong>
                      </div>
                      <Link href="/cart" className="ws-btn ws-btn-outline ws-btn-sm" style={{ width: "100%", borderRadius: 20 }}>View cart</Link>
                      <Link href="/checkout" className="ws-btn ws-btn-fill ws-btn-sm" style={{ width: "100%", borderRadius: 20 }}>Checkout</Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav - Browse categories + shop links - XStore minimal */}
      <nav className="ws-nav" aria-label="Secondary navigation">
        <div className="container">
          <div className="ws-nav-inner">
            <div className="ws-nav-cats">
              <button className="ws-nav-cats-btn" onClick={() => setCatsOpen(!catsOpen)} aria-expanded={catsOpen}>
                <LayoutGrid size={14} strokeWidth={1.8} />
                Browse Categories
                <ChevronDown size={12} style={{ marginLeft: "auto", transition: "transform 0.2s", transform: catsOpen ? "rotate(180deg)" : "none" }} />
              </button>
              <div className={`ws-nav-cats-dropdown ${catsOpen ? "open" : ""}`}>
                <div className="ws-nav-cats-list">
                  {CATEGORIES.map((c) => (
                    <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} onClick={() => setCatsOpen(false)}>
                      <span style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", display: "inline-flex", background: "#f3f5f9", border: "1px solid #E5E5E5" }}>
                        <img src={c.image} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </span>
                      {c.label}
                    </Link>
                  ))}
                  <Link href="/shop" onClick={() => setCatsOpen(false)} style={{ borderTop: "1px solid #E5E5E5", marginTop: 6, paddingTop: 10, fontWeight: 700, color: "#2A74ED" }}>
                    All Products →
                  </Link>
                </div>
              </div>
            </div>

            <ul className="ws-nav-list">
              <li><Link href="/" className={isActive("/") ? "active" : ""}>Home</Link></li>
              <li className="ws-has-mega">
                <Link href="/shop" className="mega-toggle">Shop <ChevronDown size={11} style={{ opacity: 0.6 }} /></Link>
                <div className="ws-mega">
                  <div className="ws-mega-container">
                    <div className="ws-mega-col">
                      <h4 className="mega-title">Categories</h4>
                      <ul className="mega-list">
                        {CATEGORIES.map((c) => (
                          <li key={c.key}><Link href={`/shop?cat=${encodeURIComponent(c.key)}`}>{c.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div className="ws-mega-col">
                      <h4 className="mega-title">Shop By Type</h4>
                      <ul className="mega-list">
                        <li><Link href="/shop?kind=course">Courses</Link></li>
                        <li><Link href="/shop?kind=book">Digital Books</Link></li>
                        <li><Link href="/shop?kind=tool">Software & Tools</Link></li>
                        <li><Link href="/shop?q=free">Free Courses</Link></li>
                      </ul>
                    </div>
                    <div className="ws-mega-col">
                      <h4 className="mega-title">Popular</h4>
                      <ul className="mega-list">
                        <li><Link href="/product/complete-ethical-hacking-penetration-testing">Ethical Hacking Mastery</Link></li>
                        <li><Link href="/product/python-complete-course-beginner-to-advanced">Python Complete</Link></li>
                        <li><Link href="/product/complete-javascript-mastery">JavaScript Mastery</Link></li>
                        <li><Link href="/product/stock-market-mastery-zero-to-pro">Stock Market Mastery</Link></li>
                      </ul>
                    </div>
                    <div className="ws-mega-col">
                      <div className="ws-mega-featured">
                        <h4 className="mega-title">Featured Deal</h4>
                        <div className="mega-featured-img"><img src="/images/complete ethical hacking & penetration testing.jpeg" alt="Featured" /></div>
                        <h5 className="mega-featured-title"><Link href="/product/complete-ethical-hacking-penetration-testing">Complete Ethical Hacking</Link></h5>
                        <div className="mega-featured-price">₹199 <span className="old-price">₹499</span></div>
                        <Link href="/product/complete-ethical-hacking-penetration-testing" className="ws-btn ws-btn-fill ws-btn-sm" style={{ borderRadius: 20 }}>Get Now</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li><Link href="/about" className={isActive("/about") ? "active" : ""}>About</Link></li>
              <li><Link href="/contact" className={isActive("/contact") ? "active" : ""}>Contact</Link></li>
            </ul>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, fontSize: 12, whiteSpace: "nowrap" }} className="hide-mobile">
              <span style={{ background: "#eef3ff", color: "#2A74ED", padding: "4px 10px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, background: "#2A74ED", borderRadius: "50%", display: "inline-block" }} /> Free delivery over ₹500
              </span>
              <span style={{ color: "#FF515C", fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>FLAT 50% OFF</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer - off-canvas left with Menu / Categories tabs */}
      <div className={`ws-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="ws-drawer-overlay" onClick={() => setDrawerOpen(false)} />
        <div className="ws-drawer-panel">
          <div className="ws-drawer-head">
            <img src="/logo/edulogo.jpeg" alt="EduBazar" />
            <span>EduBazar.shop</span>
            <button className="ws-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>

          <div className="drawer-tab-row">
            <button className={`drawer-tab ${drawerTab === "menu" ? "active" : ""}`} onClick={() => setDrawerTab("menu")}>Menu</button>
            <button className={`drawer-tab ${drawerTab === "categories" ? "active" : ""}`} onClick={() => setDrawerTab("categories")}>Categories</button>
          </div>

          {/* Search inside drawer */}
          <div style={{ padding: "12px", borderBottom: "1px solid #E5E5E5" }}>
            <div style={{ display: "flex", border: "1px solid #E5E5E5", borderRadius: 20, overflow: "hidden", background: "#f8f9fb" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Search products..."
                style={{ flex: 1, padding: "10px 14px", border: "none", outline: "none", fontSize: 13, background: "transparent" }}
              />
              <button onClick={() => doSearch()} style={{ background: "#2A74ED", color: "#fff", padding: "0 16px", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="ws-drawer-nav">
            {drawerTab === "menu" ? (
              <>
                <Link href="/" onClick={() => setDrawerOpen(false)}>Home</Link>
                <Link href="/shop" onClick={() => setDrawerOpen(false)}>Shop</Link>
                <Link href="/about" onClick={() => setDrawerOpen(false)}>About Us</Link>
                <Link href="/contact" onClick={() => setDrawerOpen(false)}>Contact</Link>
                <Link href="/wishlist" onClick={() => setDrawerOpen(false)}>Wishlist {mounted && wishlist.length > 0 ? `(${wishlist.length})` : ""}</Link>
                <Link href="/compare" onClick={() => setDrawerOpen(false)}>Compare {mounted && compare.length > 0 ? `(${compare.length})` : ""}</Link>
                <Link href="/cart" onClick={() => setDrawerOpen(false)}>Cart {mounted && cartCount > 0 ? `(${cartCount})` : ""}</Link>
                <div className="ws-drawer-label">Account</div>
                {mounted && user ? (
                  <>
                    <Link href="/account" onClick={() => setDrawerOpen(false)}>My Dashboard</Link>
                    <Link href="/account" onClick={() => setDrawerOpen(false)}>{user.email}</Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setDrawerOpen(false)}>Login</Link>
                    <Link href="/register" onClick={() => setDrawerOpen(false)}>Register</Link>
                  </>
                )}
              </>
            ) : (
              <>
                {CATEGORIES.map((c) => (
                  <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} onClick={() => setDrawerOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", display: "inline-flex", background: "#f8f9fb", border: "1px solid #E5E5E5" }}>
                      <img src={c.image} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </span>
                    {c.label}
                  </Link>
                ))}
                <Link href="/shop" onClick={() => setDrawerOpen(false)} style={{ fontWeight: 700, color: "#2A74ED", marginTop: 6 }}>View All Products →</Link>
              </>
            )}
          </div>

          <div style={{ padding: 12, borderTop: "1px solid #E5E5E5", display: "flex", gap: 8 }}>
            <Link href="/wishlist" onClick={() => setDrawerOpen(false)} className="ws-icon-btn" style={{ flex: 1, borderRadius: 20, width: "auto", height: 42 }}><Heart size={16} /> Wishlist</Link>
            <Link href="/cart" onClick={() => setDrawerOpen(false)} className="ws-icon-btn ws-tools-cart" style={{ flex: 1, borderRadius: 20, width: "auto", height: 42 }}><ShoppingBag size={16} /> Cart</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px){
          .hide-mobile{ display:none !important; }
          .ws-search-bar{ display:none !important; }
        }
        @media (min-width: 1025px){
          .ws-hamburger{ display:none !important; }
        }
      `}</style>
    </>
  );
}
