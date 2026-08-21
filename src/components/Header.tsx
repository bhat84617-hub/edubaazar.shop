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
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setAnnounceIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setResults(searchProducts(query));
  }, [query]);

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

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Announcement bar */}
      <div className="announce-bar">
        <div className="announce-inner container" key={announceIdx}>
          <span>
            <ShieldCheck size={15} />
            {ANNOUNCEMENTS[announceIdx]}
          </span>
        </div>
      </div>

      {/* Top bar */}
      <div className="wm-topbar">
        <div className="container">
          <div className="wm-topbar-left">
            <a href={`tel:+91${STORE.phoneRaw}`}>
              <Phone size={12} /> +91 {STORE.phoneRaw}
            </a>
            <a href={`mailto:${STORE.email}`} className="hide-sm">
              <Mail size={12} /> {STORE.email}
            </a>
          </div>
          <div className="wm-topbar-right">
            {mounted && user ? (
              <>
                <Link href="/account">
                  <LayoutDashboard size={12} /> Dashboard
                </Link>
                <button onClick={logout} className="tb-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="wm-header">
        <div className="wm-main-header">
          <div className="container">
            <button className="hamburger header-icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu">
              <Menu size={24} />
            </button>

            <Link href="/" className="wm-logo">
              <img src="/logo/edulogo.jpeg" alt="EduBazar Logo" />
              <span>EduBazar</span>
            </Link>

            <div className="header-search" ref={searchRef}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Search courses, books, tools..."
              />
              <button onClick={() => doSearch()} aria-label="Search">
                <Search size={17} />
              </button>
              {results.length > 0 && (
                <div className="search-results">
                  {results.map((p) => (
                    <div
                      key={p.id}
                      className="search-result-item"
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
                      <strong style={{ fontSize: 13, color: "var(--primary)" }}>
                        {formatINR(p.price)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="header-actions">
              <Link href="/wishlist" className="header-icon-btn" aria-label="Wishlist">
                <Heart size={22} />
                {mounted && wishlist.length > 0 && <span className="icon-badge">{wishlist.length}</span>}
              </Link>

              <div className="group" style={{ position: "relative" }}>
                <Link href="/cart" className="header-icon-btn" aria-label="Cart">
                  <ShoppingCart size={22} />
                  {mounted && cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
                </Link>
                <div className="mini-cart">
                  <div className="mini-cart-title">
                    Shopping Cart {mounted && `(${cartCount} item${cartCount !== 1 ? "s" : ""})`}
                  </div>
                  {mounted && cart.length === 0 ? (
                    <div className="mini-cart-empty">Your cart is empty.</div>
                  ) : (
                    <>
                      {mounted &&
                        cart.slice(0, 3).map((item) => {
                          const p = getProductById(item.id);
                          if (!p) return null;
                          return (
                            <div key={item.id} className="mini-cart-item">
                              <img src={p.images[0]} alt={p.title} />
                              <div style={{ flex: 1 }}>
                                <h5>{p.title}</h5>
                                <p>{formatINR(p.price)} × {item.qty}</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                aria-label="Remove"
                                style={{ background: "none", border: "none", color: "var(--muted)" }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}
                      <div className="mini-cart-footer">
                        <div className="sum-row">
                          <span>Subtotal</span>
                          <strong style={{ color: "var(--primary)" }}>{formatINR(cartSubtotal)}</strong>
                        </div>
                        <Link href="/cart" className="btn btn-primary btn-sm btn-block" style={{ marginTop: 10 }}>
                          View Cart
                        </Link>
                        <Link href="/checkout" className="btn btn-accent btn-sm btn-block" style={{ marginTop: 8 }}>
                          Checkout <MoveRight size={15} />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Link href={mounted && user ? "/account" : "/login"} className="header-icon-btn" aria-label="Account">
                <User size={22} />
              </Link>

              <Link href="/cart" className="header-icon-btn header-cart-btn" aria-label="Cart">
                <ShoppingCart size={19} />
                <span className="cart-label">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="wm-nav">
          <div className="container">
            <ul>
              <li>
                <Link href="/" className={isActive("/") ? "active" : ""}>Home</Link>
              </li>
              <li className="has-mega">
                <Link href="/shop">
                  Shop <ChevronDown size={14} />
                </Link>
                <div className="mega-menu">
                  <div className="container">
                    <div className="mega-grid">
                      <div className="mega-col">
                        <h4>Categories</h4>
                        <ul>
                          {CATEGORIES.map((c) => (
                            <li key={c.key}>
                              <Link href={`/shop?cat=${encodeURIComponent(c.key)}`}>{c.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mega-col">
                        <h4>Shop By Type</h4>
                        <ul>
                          <li><Link href="/shop?kind=course">Courses <span>19</span></Link></li>
                          <li><Link href="/shop?kind=book">Digital Books <span>5</span></Link></li>
                          <li><Link href="/shop?kind=tool">Software & Tools <span>7</span></Link></li>
                          <li><Link href="/shop?sort=price_low">Under ₹200</Link></li>
                          <li><Link href="/shop?q=free">Free Courses</Link></li>
                        </ul>
                      </div>
                      <div className="mega-col">
                        <h4>Popular Courses</h4>
                        <ul>
                          <li><Link href="/product/complete-ethical-hacking-penetration-testing">Ethical Hacking Mastery</Link></li>
                          <li><Link href="/product/python-complete-course-beginner-to-advanced">Python Complete Course</Link></li>
                          <li><Link href="/product/complete-javascript-mastery">JavaScript Mastery</Link></li>
                          <li><Link href="/product/stock-market-mastery-zero-to-pro">Stock Market Mastery</Link></li>
                          <li><Link href="/product/ui-ux-design-complete-course">UI/UX Design Course</Link></li>
                        </ul>
                      </div>
                      <div className="mega-col">
                        <div className="mega-featured">
                          <h4>Featured Deal</h4>
                          <img src="/images/ethical-hacking-pentest.jpeg" alt="Ethical Hacking" />
                          <p>Complete Ethical Hacking &amp; Penetration Testing</p>
                          <span className="price">₹199 <s style={{ opacity: 0.7, fontSize: 13 }}>₹499</s></span>
                          <Link href="/product/complete-ethical-hacking-penetration-testing" className="btn btn-accent btn-sm">
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <Link href="/shop?cat=Hacking" className={pathname === "/shop" ? "active" : ""}>Hacking</Link>
              </li>
              <li>
                <Link href="/shop?cat=Programming">Programming</Link>
              </li>
              <li>
                <Link href="/shop?cat=Trading">Trading</Link>
              </li>
              <li>
                <Link href="/shop?cat=Books">Books</Link>
              </li>
              <li>
                <Link href="/shop?cat=Tools">Tools</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
        <div className="drawer-panel">
          <div className="drawer-head">
            <img src="/logo/edulogo.jpeg" alt="EduBazar" />
            <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="drawer-nav">
            <Link href="/" onClick={() => setDrawerOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setDrawerOpen(false)}>All Products</Link>
            <div className="sub-label">Categories</div>
            {CATEGORIES.map((c) => (
              <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} onClick={() => setDrawerOpen(false)}>
                {c.label}
              </Link>
            ))}
            <div className="sub-label">Account</div>
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
