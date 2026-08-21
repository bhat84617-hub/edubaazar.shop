"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu, X, Search, Heart, ShoppingCart, User, Phone, Mail,
  ChevronDown, ArrowRight, Trash2, MoveRight, ShieldCheck, LayoutDashboard,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getProductById, searchProducts, formatINR, CATEGORIES } from "@/lib/products";
import { STORE } from "@/lib/config";

const ANNOUNCEMENTS = [
  "Free Course Delivery 24/7 — Instant Access after payment",
  "FLAT 50% OFF — Use code EDU50 at checkout",
  "100% Secure UPI Payments",
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, cartSubtotal, cart, wishlist, user, logout, removeFromCart, mounted } = useStore();

  const [announceIdx, setAnnounceIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchProducts>>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";

  useEffect(() => {
    const t = setInterval(() => setAnnounceIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setResults(searchProducts(query));
  }, [query]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
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
    router.push(`/shop?q=${encodeURIComponent(term)}`);
    setQuery("");
    setResults([]);
    setDrawerOpen(false);
  };

  const isActive = (href: string) => pathname === href;
  const headerTransparent = isHome && !scrolled;

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Rotating promo ribbon */}
      <div className={`ws-promo-ribbon ${headerTransparent ? "ribbon-transparent" : ""}`}>
        <div className="ws-promo-inner" key={announceIdx}>
          <span>{ANNOUNCEMENTS[announceIdx]}</span>
        </div>
      </div>

      {/* Main header */}
      <header className={`ws-header ${headerTransparent ? "ws-header-transparent" : ""} ${scrolled ? "ws-header-scrolled" : ""}`}>
        <div className="ws-header-inner container">
          {/* Hamburger */}
          <button className="ws-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Logo — center */}
          <Link href="/" className="ws-logo">
            <img src="/logo/edulogo.jpeg" alt="EduBazar" />
            <span className="ws-logo-text">EduBazar</span>
          </Link>

          {/* Right icons */}
          <div className="ws-header-right">
            {/* Search */}
            <div className="ws-search" ref={searchRef}>
              <button className="ws-icon-btn" aria-label="Search" onClick={() => {
                const el = document.querySelector(".ws-search-input") as HTMLInputElement;
                el?.focus();
              }}>
                <Search size={20} strokeWidth={1.5} />
              </button>
              <input
                className="ws-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Search..."
              />
              {results.length > 0 && (
                <div className="ws-search-results">
                  {results.map((p) => (
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
                      <div style={{ flex: 1 }}>
                        <h4>{p.title}</h4>
                        <p>{p.category}</p>
                      </div>
                      <strong>{formatINR(p.price)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/wishlist" className="ws-icon-btn" aria-label="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
              {mounted && wishlist.length > 0 && <span className="ws-badge">{wishlist.length}</span>}
            </Link>

            <div className="ws-cart-wrap">
              <Link href="/cart" className="ws-icon-btn" aria-label="Cart">
                <ShoppingCart size={20} strokeWidth={1.5} />
                {mounted && cartCount > 0 && <span className="ws-badge">{cartCount}</span>}
              </Link>
              {/* Mini cart dropdown */}
              <div className="ws-mini-cart">
                <div className="ws-mini-cart-head">
                  Shopping Cart {mounted && `(${cartCount})`}
                </div>
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
                          <div style={{ flex: 1 }}>
                            <h5>{p.title}</h5>
                            <p>{formatINR(p.price)} × {item.qty}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} aria-label="Remove" className="ws-mini-cart-remove">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                    <div className="ws-mini-cart-foot">
                      <div className="ws-mini-cart-total">
                        <span>Subtotal</span>
                        <strong>{formatINR(cartSubtotal)}</strong>
                      </div>
                      <Link href="/cart" className="ws-btn ws-btn-outline ws-btn-sm">View Cart</Link>
                      <Link href="/checkout" className="ws-btn ws-btn-fill ws-btn-sm" style={{ marginTop: 6 }}>Checkout</Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Link href={mounted && user ? "/account" : "/login"} className="ws-icon-btn" aria-label="Account">
              <User size={20} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`ws-nav ${headerTransparent ? "ws-nav-transparent" : ""}`}>
          <div className="container">
            <ul className="ws-nav-list">
              <li>
                <Link href="/" className={isActive("/") ? "active" : ""}>Home</Link>
              </li>
              <li className="ws-has-mega">
                <Link href="/shop">
                  Shop <ChevronDown size={13} />
                </Link>
                <div className="ws-mega">
                  <div className="container">
                    <div className="ws-mega-grid">
                      <div className="ws-mega-col">
                        <h4>Categories</h4>
                        <ul>
                          {CATEGORIES.map((c) => (
                            <li key={c.key}>
                              <Link href={`/shop?cat=${encodeURIComponent(c.key)}`}>{c.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="ws-mega-col">
                        <h4>Shop By Type</h4>
                        <ul>
                          <li><Link href="/shop?kind=course">Courses</Link></li>
                          <li><Link href="/shop?kind=book">Digital Books</Link></li>
                          <li><Link href="/shop?kind=tool">Software & Tools</Link></li>
                          <li><Link href="/shop?sort=price_low">Under ₹200</Link></li>
                          <li><Link href="/shop?q=free">Free Courses</Link></li>
                        </ul>
                      </div>
                      <div className="ws-mega-col">
                        <h4>Popular Courses</h4>
                        <ul>
                          <li><Link href="/product/complete-ethical-hacking-penetration-testing">Ethical Hacking Mastery</Link></li>
                          <li><Link href="/product/python-complete-course-beginner-to-advanced">Python Complete Course</Link></li>
                          <li><Link href="/product/complete-javascript-mastery">JavaScript Mastery</Link></li>
                          <li><Link href="/product/stock-market-mastery-zero-to-pro">Stock Market Mastery</Link></li>
                          <li><Link href="/product/ui-ux-design-complete-course">UI/UX Design Course</Link></li>
                        </ul>
                      </div>
                      <div className="ws-mega-col">
                        <div className="ws-mega-featured">
                          <h4>Featured Deal</h4>
                          <img src="/images/ethical-hacking-pentest.jpeg" alt="Ethical Hacking" />
                          <p>Complete Ethical Hacking &amp; Penetration Testing</p>
                          <span className="ws-mega-price">₹199 <s>₹499</s></span>
                          <Link href="/product/complete-ethical-hacking-penetration-testing" className="ws-btn ws-btn-outline ws-btn-sm">
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li><Link href="/shop?cat=Hacking" className={pathname === "/shop" ? "active" : ""}>Hacking</Link></li>
              <li><Link href="/shop?cat=Programming">Programming</Link></li>
              <li><Link href="/shop?cat=Trading">Trading</Link></li>
              <li><Link href="/shop?cat=Books">Books</Link></li>
              <li><Link href="/shop?cat=Tools">Tools</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div className={`ws-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="ws-drawer-overlay" onClick={() => setDrawerOpen(false)} />
        <div className="ws-drawer-panel">
          <div className="ws-drawer-head">
            <img src="/logo/edulogo.jpeg" alt="EduBazar" />
            <span>EduBazar</span>
            <button className="ws-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="ws-drawer-nav">
            <Link href="/" onClick={() => setDrawerOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setDrawerOpen(false)}>All Products</Link>
            <div className="ws-drawer-label">Categories</div>
            {CATEGORIES.map((c) => (
              <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} onClick={() => setDrawerOpen(false)}>
                {c.label}
              </Link>
            ))}
            <div className="ws-drawer-label">Account</div>
            <Link href="/wishlist" onClick={() => setDrawerOpen(false)}>Wishlist</Link>
            <Link href="/compare" onClick={() => setDrawerOpen(false)}>Compare</Link>
            <Link href="/cart" onClick={() => setDrawerOpen(false)}>Cart</Link>
            {mounted && user ? (
              <>
                <Link href="/account" onClick={() => setDrawerOpen(false)}>My Dashboard</Link>
                <Link href="/login" onClick={() => { logout(); setDrawerOpen(false); }}>Logout</Link>
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
    </>
  );
}
