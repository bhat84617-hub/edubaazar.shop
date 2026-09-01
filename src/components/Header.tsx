"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu, X, Search, Heart, ShoppingBag, User, ChevronDown, Trash2, LayoutGrid,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getProductById, searchProducts, formatINR, CATEGORIES } from "@/lib/products";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, cartSubtotal, cart, wishlist, user, logout, removeFromCart, mounted } = useStore();

  const [currentCat, setCurrentCat] = useState("");
  const [searchCat, setSearchCat] = useState("All categories");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchProducts>>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCurrentCat(params.get("cat") ?? "");
  }, [pathname]);

  useEffect(() => {
    setResults(searchProducts(query));
  }, [query]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
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
      {/* Header accessories - white, no top bar */}
      <header className={`ws-header ${scrolled ? "ws-header-scrolled" : ""}`} style={{ borderBottom: "1px solid #e6e6e6" }}>
        <div className="ws-header-inner container" style={{ minHeight: scrolled ? "60px" : "90px" }}>
          {/* Mobile hamburger */}
          <button className="ws-hamburger" style={{ display: "flex" }} onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo left */}
          <Link href="/" className="ws-logo" style={{ flexShrink: 0 }}>
            <img src="/logo/edulogo.jpeg" alt="EduBazar" />
            <span className="ws-logo-text">EduBazar<span style={{ color: "rgb(46,107,198)" }}>.shop</span></span>
          </Link>

          {/* Search center - WoodMart accessories style with category dropdown */}
          <div className="ws-search-bar" ref={searchRef} style={{ margin: "0 20px" }}>
            <div className="ws-search-bar-cat" style={{ gap: 4 }}>
              <select value={searchCat} onChange={(e) => setSearchCat(e.target.value)} aria-label="Category">
                <option>All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ marginLeft: -12, pointerEvents: "none", color: "#999" }} />
            </div>
            <input
              className="ws-search-bar-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="Search for products"
            />
            <button className="ws-search-bar-btn" onClick={() => doSearch()} aria-label="Search">
              <Search size={18} strokeWidth={2} />
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
                      <p>{p.category} &bull; {formatINR(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right tools - wishlist, account, cart with total like WoodMart */}
          <div className="ws-header-right">
            <Link href="/wishlist" className="ws-icon-btn" aria-label="Wishlist" style={{ flexDirection: "column", gap: 2 }}>
              <span className="wd-tools-icon">
                <Heart size={22} strokeWidth={1.5} />
                {mounted && wishlist.length > 0 && <span className="ws-badge">{wishlist.length}</span>}
              </span>
              <span style={{ fontSize: 11, color: "#777", display: "none" }} className="hide-mobile">Wishlist</span>
            </Link>

            <Link href={mounted && user ? "/account" : "/login"} className="ws-icon-btn" aria-label="Account">
              <User size={22} strokeWidth={1.5} />
            </Link>

            <div className="ws-cart-wrap">
              <Link href="/cart" className="ws-icon-btn ws-tools-cart" aria-label="Cart" style={{ gap: 8, paddingLeft: 8 }}>
                <span className="wd-tools-icon">
                  <ShoppingBag size={22} strokeWidth={1.5} />
                  {mounted && cartCount > 0 && <span className="ws-badge">{cartCount}</span>}
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }} className="hide-mobile">
                  <small style={{ fontSize: 11, color: "#777", fontWeight: 400, whiteSpace: "nowrap" }}>{mounted ? `${cartCount} items` : "0 items"}</small>
                  <strong style={{ fontSize: 13, color: "rgb(46,107,198)", fontWeight: 700, whiteSpace: "nowrap" }}>{mounted ? formatINR(cartSubtotal) : "₹0.00"}</strong>
                </span>
                {/* mobile fallback */}
                <span style={{ fontSize: 13, fontWeight: 600 }} className="ws-cart-mobile-total hide-desktop">
                  {mounted && cartCount > 0 ? `${cartCount} / ${formatINR(cartSubtotal)}` : ""}
                </span>
              </Link>
              {/* Mini cart dropdown */}
              <div className="ws-mini-cart">
                <div className="ws-mini-cart-head">Shopping Cart {mounted && `(${cartCount})`}</div>
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
                          <button onClick={() => removeFromCart(item.id)} aria-label="Remove"><Trash2 size={14} /></button>
                        </div>
                      );
                    })}
                    <div className="ws-mini-cart-foot">
                      <div className="ws-mini-cart-total">
                        <span>Subtotal</span>
                        <strong>{formatINR(cartSubtotal)}</strong>
                      </div>
                      <Link href="/cart" className="ws-btn ws-btn-outline ws-btn-sm" style={{ width: "100%" }}>View Cart</Link>
                      <Link href="/checkout" className="ws-btn ws-btn-fill ws-btn-sm" style={{ width: "100%" }}>Checkout</Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav bar accessories - white with bottom border, Browse Categories on left */}
      <nav className="ws-nav" aria-label="Main navigation">
        <div className="container">
          <div className="ws-nav-inner">
            {/* Browse Categories button */}
            <div className="ws-nav-cats">
              <button
                className="ws-nav-cats-btn"
                onClick={() => setCatsOpen(!catsOpen)}
                aria-expanded={catsOpen}
                aria-haspopup="true"
              >
                <LayoutGrid size={16} strokeWidth={1.8} />
                Browse Categories
                <ChevronDown size={14} style={{ marginLeft: "auto", transition: "transform 0.2s", transform: catsOpen ? "rotate(180deg)" : "none" }} />
              </button>
              <div className={`ws-nav-cats-dropdown ${catsOpen ? "open" : ""}`} style={{ opacity: catsOpen ? 1 : undefined, visibility: catsOpen ? "visible" as const : undefined, transform: catsOpen ? "translateY(0)" : undefined }}>
                <div className="ws-nav-cats-list">
                  {CATEGORIES.map((c) => (
                    <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} onClick={() => setCatsOpen(false)}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(46,107,198)", display: "inline-block" }} />
                      {c.label}
                    </Link>
                  ))}
                  <Link href="/shop" onClick={() => setCatsOpen(false)} style={{ borderTop: "1px solid #eee", marginTop: 6, paddingTop: 12, fontWeight: 600, color: "rgb(46,107,198)" }}>
                    All Products →
                  </Link>
                </div>
              </div>
            </div>

            {/* Horizontal nav links */}
            <ul className="ws-nav-list">
              <li><Link href="/" className={isActive("/") ? "active" : ""}>Home</Link></li>
              <li className="ws-has-mega">
                <Link href="/shop" className="mega-toggle">Shop <ChevronDown size={12} /></Link>
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
                        <li><Link href="/shop?sort=price_low">Under ₹200</Link></li>
                        <li><Link href="/shop?q=free">Free Courses</Link></li>
                      </ul>
                    </div>
                    <div className="ws-mega-col">
                      <h4 className="mega-title">Popular Courses</h4>
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
                        <Link href="/product/complete-ethical-hacking-penetration-testing" className="ws-btn ws-btn-fill ws-btn-sm">Get Now</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li><Link href="/shop" className={pathname.startsWith("/shop") ? "active" : ""}>Store</Link></li>
              <li><Link href="/about" className={isActive("/about") ? "active" : ""}>About</Link></li>
              <li><Link href="/contact" className={isActive("/contact") ? "active" : ""}>Contact</Link></li>
            </ul>

            {/* Right highlight - accessories often has special offer text */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16, fontSize: 13, whiteSpace: "nowrap" }} className="hide-mobile">
              <span style={{ color: "#777" }}>Free Shipping on orders over ₹500</span>
              <span style={{ color: "rgb(46,107,198)", fontWeight: 700 }}>FLAT 50% OFF</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`ws-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="ws-drawer-overlay" onClick={() => setDrawerOpen(false)} />
        <div className="ws-drawer-panel">
          <div className="ws-drawer-head">
            <img src="/logo/edulogo.jpeg" alt="EduBazar" />
            <span>EduBazar</span>
            <button className="ws-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>
          {/* Mobile search inside drawer */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", border: "2px solid #e6e6e6", borderRadius: 0 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Search products..."
                style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 14 }}
              />
              <button onClick={() => doSearch()} style={{ background: "rgb(46,107,198)", color: "#fff", padding: "0 16px", border: "none" }}>
                <Search size={16} />
              </button>
            </div>
          </div>
          <div className="ws-drawer-nav">
            <Link href="/" onClick={() => setDrawerOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setDrawerOpen(false)}>Shop All</Link>
            <Link href="/about" onClick={() => setDrawerOpen(false)}>About Us</Link>
            <Link href="/contact" onClick={() => setDrawerOpen(false)}>Contact</Link>
            <div className="ws-drawer-label">Categories</div>
            {CATEGORIES.map((c) => (
              <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} onClick={() => setDrawerOpen(false)}>{c.label}</Link>
            ))}
            <div className="ws-drawer-label">Account</div>
            <Link href="/wishlist" onClick={() => setDrawerOpen(false)}>Wishlist ({mounted ? wishlist.length : 0})</Link>
            <Link href="/cart" onClick={() => setDrawerOpen(false)}>Cart ({mounted ? cartCount : 0})</Link>
            {mounted && user ? (
              <>
                <Link href="/account" onClick={() => setDrawerOpen(false)}>My Dashboard</Link>
                <button onClick={() => { logout(); setDrawerOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "none", border: "none", borderBottom: "1px solid #f0f0f0", fontSize: 14, cursor: "pointer" }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setDrawerOpen(false)}>Login</Link>
                <Link href="/register" onClick={() => setDrawerOpen(false)}>Sign Up</Link>
              </>
            )}
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
          .hide-desktop{ display:none !important; }
        }
        @media (max-width: 640px){
          .ws-nav-cats-btn{ font-size:12px; padding:0 12px; height:44px; }
          .ws-nav-inner{ min-height:44px; }
        }
      `}</style>
    </>
  );
}
