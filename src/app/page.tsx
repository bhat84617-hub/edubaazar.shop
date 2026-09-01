import Link from "next/link";
import { GraduationCap, Zap, Headset, ShieldCheck, Star, ArrowRight, Camera, TrendingUp, Award, Clock } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import BestDealSlider from "@/components/BestDealSlider";
import CountUp from "@/components/CountUp";
import NewsletterPopup from "@/components/NewsletterPopup";
import NewsletterBox from "@/components/NewsletterBox";
import { products, CATEGORIES } from "@/lib/products";

const STATS = [
  { value: 15000, suffix: "+", label: "Happy Students" },
  { value: 5000, suffix: "+", label: "Courses Delivered" },
  { value: 25000, suffix: "+", label: "Downloads" },
  { value: 33, suffix: "+", label: "Expert Courses" },
];

const TESTIMONIALS = [
  { name: "Student from Delhi", role: "Ethical Hacking Course", text: "Bought the hacking course for just ₹199. Content quality is amazing — practical labs, real projects. UPI payment was instant, got access within minutes." },
  { name: "Student from Maharashtra", role: "Python Complete Course", text: "Started learning Python from zero. The course is well-structured and easy to follow. Best investment I've made in my career." },
  { name: "Student from UP", role: "Stock Market Course", text: "The trading psychology content changed my approach completely. Very practical and beginner-friendly. Highly recommended." },
];

const IG = [
  "/images/ethical-hacking-pentest.jpeg",
  "/images/python-complete.jpeg",
  "/images/uiux-design.jpeg",
  "/images/hacking-bible.jpeg",
  "/images/javascript-mastery.jpeg",
  "/images/mindfluential-trading.jpeg",
];

const featured = products.filter((p) => p.featured).slice(0, 8);
const bestSellers = products.filter((p) => p.badge === "Bestseller").slice(0, 8);
const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
const freeStuff = products.filter((p) => p.price <= 0).slice(0, 4);

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Category circles - WoodMart accessories style */}
      <section className="ws-section-sm" style={{ background: "#fff", padding: "30px 0" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "10px 0", scrollbarWidth: "none", justifyContent: "space-between" }}>
            {CATEGORIES.map((c) => {
              const count = products.filter((p) => p.category === c.key).length;
              return (
                <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 110, flex: "1 1 0" }}>
                  <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", background: "#f9f9f9", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={c.image} alt={c.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>{count} products</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products with tabs - accessories style */}
      <section className="ws-section" style={{ background: "#fff", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 30 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", textAlign: "center" }}>Featured Products</h2>
            <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #e6e6e6", paddingBottom: 0 }}>
              <span style={{ padding: "8px 4px", borderBottom: "2px solid rgb(46,107,198)", fontSize: 13, fontWeight: 600, color: "rgb(46,107,198)", textTransform: "uppercase", letterSpacing: 0.5 }}>Featured</span>
              <Link href="/shop?sort=bestseller" style={{ padding: "8px 4px", fontSize: 13, fontWeight: 500, color: "#777", textTransform: "uppercase", letterSpacing: 0.5 }}>Bestseller</Link>
              <Link href="/shop?sort=newest" style={{ padding: "8px 4px", fontSize: 13, fontWeight: 500, color: "#777", textTransform: "uppercase", letterSpacing: 0.5 }}>New Arrivals</Link>
            </div>
          </div>
          <div className="ws-product-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/shop" className="ws-btn ws-btn-outline">View All Products <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* Banners - accessories 3 banners */}
      <section style={{ background: "#fff", padding: "0 0 40px" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <div style={{ position: "relative", overflow: "hidden", background: "#e8eef8", minHeight: 260, display: "flex", alignItems: "center", padding: "30px 40px", border: "1px solid #e6e6e6" }}>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 320 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgb(46,107,198)", textTransform: "uppercase", letterSpacing: 1 }}>Limited Time</span>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "#333", margin: "6px 0 10px", lineHeight: 1.2 }}>Hacking Courses<br />Up to 60% OFF</h3>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Master ethical hacking & penetration testing</p>
              <Link href="/shop?cat=Hacking" style={{ display: "inline-flex", background: "rgb(46,107,198)", color: "#fff", padding: "10px 22px", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Shop Now</Link>
            </div>
            <img src="/images/complete ethical hacking & penetration testing.jpeg" alt="Hacking" style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
          </div>
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ position: "relative", overflow: "hidden", background: "#fef3e2", minHeight: 120, display: "flex", alignItems: "center", padding: "20px 24px", border: "1px solid #e6e6e6" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>Python Mastery</h4>
                <p style={{ fontSize: 12, color: "#666", margin: "4px 0 10px" }}>From ₹199 only</p>
                <Link href="/shop?cat=Programming" style={{ fontSize: 12, fontWeight: 600, color: "rgb(46,107,198)", textTransform: "uppercase" }}>Shop Now →</Link>
              </div>
              <img src="/images/python-complete.jpeg" alt="Python" style={{ position: "absolute", right: 0, top: 0, width: "55%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "relative", overflow: "hidden", background: "#e6f4ea", minHeight: 120, display: "flex", alignItems: "center", padding: "20px 24px", border: "1px solid #e6e6e6" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>Trading Pro</h4>
                <p style={{ fontSize: 12, color: "#666", margin: "4px 0 10px" }}>Stock & Crypto</p>
                <Link href="/shop?cat=Trading" style={{ fontSize: 12, fontWeight: 600, color: "rgb(46,107,198)", textTransform: "uppercase" }}>Shop Now →</Link>
              </div>
              <img src="/images/mastring stock trading.jpeg" alt="Trading" style={{ position: "absolute", right: 0, top: 0, width: "55%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="ws-section" style={{ background: "#f9f9f9", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333" }}>Bestsellers</h2>
            <Link href="/shop?sort=bestseller" style={{ fontSize: 13, fontWeight: 600, color: "rgb(46,107,198)" }}>View all →</Link>
          </div>
          <div className="ws-product-grid">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <BestDealSlider />

      {/* Trust / features accessories style - 4 cols with icons */}
      <section className="ws-section" style={{ background: "#fff", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, textAlign: "center" }}>
            <div style={{ padding: 20 }}>
              <GraduationCap size={36} strokeWidth={1.3} style={{ color: "rgb(46,107,198)", margin: "0 auto 12px" }} />
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#333", marginBottom: 6 }}>Expert Courses</h4>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>Learn from industry professionals</p>
            </div>
            <div style={{ padding: 20 }}>
              <Zap size={36} strokeWidth={1.3} style={{ color: "rgb(46,107,198)", margin: "0 auto 12px" }} />
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#333", marginBottom: 6 }}>Instant Delivery</h4>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>Immediate access after payment</p>
            </div>
            <div style={{ padding: 20 }}>
              <Headset size={36} strokeWidth={1.3} style={{ color: "rgb(46,107,198)", margin: "0 auto 12px" }} />
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#333", marginBottom: 6 }}>24/7 Support</h4>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>Round-the-clock assistance</p>
            </div>
            <div style={{ padding: 20 }}>
              <ShieldCheck size={36} strokeWidth={1.3} style={{ color: "rgb(46,107,198)", margin: "0 auto 12px" }} />
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#333", marginBottom: 6 }}>Secure Payment</h4>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>100% secure UPI payments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "rgb(46,107,198)", padding: "40px 0", color: "#fff" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, textAlign: "center" }}>
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}><CountUp value={s.value} suffix={s.suffix} /></div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, opacity: 0.9, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="ws-section" style={{ background: "#fff", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333" }}>New Arrivals</h2>
            <Link href="/shop?sort=newest" style={{ fontSize: 13, fontWeight: 600, color: "rgb(46,107,198)" }}>View all →</Link>
          </div>
          <div className="ws-product-grid">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Free tools */}
      {freeStuff.length > 0 && (
        <section className="ws-section" style={{ background: "#f9f9f9", padding: "40px 0" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333" }}>Free Software & Tools</h2>
              <Link href="/shop?q=free" style={{ fontSize: 13, fontWeight: 600, color: "rgb(46,107,198)" }}>View all →</Link>
            </div>
            <div className="ws-product-grid">
              {freeStuff.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="ws-section" style={{ background: "#fff", padding: "40px 0" }}>
        <div className="container">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", textAlign: "center", marginBottom: 24 }}>What Our Students Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e6e6e6", padding: 24 }}>
                <div style={{ color: "#fbbc34", display: "flex", gap: 2, marginBottom: 12 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333", fontStyle: "italic", marginBottom: 16 }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgb(46,107,198)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>
                    {t.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="ws-section-sm" style={{ background: "#fff", padding: "30px 0" }}>
        <div className="container">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#333", textAlign: "center", marginBottom: 16 }}>Follow @edubazarshop</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
            {IG.map((src, i) => (
              <a key={i} href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#f9f9f9", display: "block" }}>
                <img src={src} alt="Instagram" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", opacity: 0, transition: "opacity 0.2s", color: "#fff" }} className="ig-hover"><Camera size={20} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter box bottom */}
      <section className="ws-section" style={{ background: "#f9f9f9", padding: "40px 0", borderTop: "1px solid #e6e6e6" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 8 }}>Subscribe & Get 10% Off</h2>
            <p style={{ fontSize: 14, color: "#777", marginBottom: 20 }}>Get the latest courses, deals & updates straight to your inbox.</p>
            <NewsletterBox />
          </div>
        </div>
      </section>

      <NewsletterPopup />

      <style>{`
        @media (max-width: 1080px){
          .ws-product-grid{ grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px){
          .ws-product-grid{ grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          div[style*="grid-template-columns: 1.4fr 1fr"]{ grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4, 1fr)"]{ grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: repeat(3, 1fr)"]{ grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(6, 1fr)"]{ grid-template-columns: repeat(3, 1fr) !important; }
        }
        a:hover .ig-hover{ opacity:1 !important; }
      `}</style>
    </>
  );
}
