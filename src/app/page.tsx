import Link from "next/link";
import { GraduationCap, Zap, Headset, ShieldCheck, Star, ArrowRight, Camera } from "lucide-react";
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

      {/* 3 benefits minimal icons - XStore minimal electronics style */}
      <section style={{ background: "#fff", padding: "16px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { icon: <Zap size={18} />, title: "Free Shipping", desc: "On orders over ₹500" },
              { icon: <ShieldCheck size={18} />, title: "Money Back", desc: "30 Days guarantee" },
              { icon: <Headset size={18} />, title: "24/7 Support", desc: "Dedicated support" },
            ].map((b) => (
              <div key={b.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f8f9fb", border: "1px solid #E5E5E5", borderRadius: 20 }}>
                <span style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #E5E5E5", borderRadius: "50%", color: "#2A74ED", flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#242424", textTransform: "uppercase", letterSpacing: 0.4 }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: "#777" }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories carousel / grid - XStore pill icons */}
      <section className="ws-section-sm" style={{ background: "#fff", padding: "18px 0 8px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "8px 2px", scrollbarWidth: "none" }}>
            {CATEGORIES.map((c) => {
              const count = products.filter((p) => p.category === c.key).length;
              return (
                <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 92, flex: "0 0 auto" }}>
                  <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", background: "#f8f9fb", border: "1px solid #E5E5E5", padding: 3, transition: "all 0.2s linear" }} className="cat-hover">
                    <img src={c.image} alt={c.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#242424" }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: "#777" }}>{count} products</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products with tabs - XStore carousel-area hover scale */}
      <section className="ws-section carousel-area" style={{ background: "#fff", padding: "28px 0" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#242424", letterSpacing: "-0.4px" }}>Featured Products</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ padding: "6px 14px", borderRadius: 20, background: "#2A74ED", color: "#fff", fontSize: 12, fontWeight: 700 }}>Featured</span>
              <Link href="/shop?sort=bestseller" style={{ padding: "6px 14px", borderRadius: 20, background: "#f8f9fb", border: "1px solid #E5E5E5", fontSize: 12, fontWeight: 600, color: "#242424" }}>Bestseller</Link>
              <Link href="/shop?sort=newest" style={{ padding: "6px 14px", borderRadius: 20, background: "#f8f9fb", border: "1px solid #E5E5E5", fontSize: 12, fontWeight: 600, color: "#242424" }}>New Arrivals</Link>
            </div>
          </div>
          <div className="p-grid">
            {featured.map((p) => (
              <div key={p.id} className="product-slide"><ProductCard product={p} /></div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/shop" className="ws-btn ws-btn-outline" style={{ borderRadius: 20 }}>View All Products <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* Banners row XStore */}
      <section style={{ background: "#fff", padding: "0 0 24px" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <div style={{ position: "relative", overflow: "hidden", background: "#eef3ff", minHeight: 240, display: "flex", alignItems: "center", padding: "26px 28px", border: "1px solid #E5E5E5", borderRadius: 20 }}>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 320 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#2A74ED", background: "#fff", padding: "4px 10px", borderRadius: 20, border: "1px solid #E5E5E5" }}>Limited Time</span>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#242424", margin: "8px 0 8px", lineHeight: 1.15, letterSpacing: "-0.4px" }}>Hacking Courses<br /><span style={{ color: "#2A74ED" }}>Up to 60% OFF</span></h3>
              <p style={{ fontSize: 12, color: "#5a657f", marginBottom: 14 }}>Master ethical hacking & penetration testing</p>
              <Link href="/shop?cat=Hacking" style={{ display: "inline-flex", background: "#2A74ED", color: "#fff", padding: "9px 18px", fontSize: 12, fontWeight: 700, borderRadius: 20 }}>Shop Now</Link>
            </div>
            <img src="/images/complete ethical hacking & penetration testing.jpeg" alt="Hacking" style={{ position: "absolute", right: 6, top: 6, width: "46%", height: "calc(100% - 12px)", objectFit: "cover", borderRadius: 16, border: "1px solid #E5E5E5" }} />
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ position: "relative", overflow: "hidden", background: "#fef6e8", minHeight: 113, display: "flex", alignItems: "center", padding: "18px 20px", border: "1px solid #E5E5E5", borderRadius: 20 }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "#242424" }}>Python Mastery</h4>
                <p style={{ fontSize: 11, color: "#5a657f", margin: "4px 0 8px" }}>From ₹199 only</p>
                <Link href="/shop?cat=Programming" style={{ fontSize: 11, fontWeight: 700, color: "#2A74ED" }}>Shop Now →</Link>
              </div>
              <img src="/images/python-complete.jpeg" alt="Python" style={{ position: "absolute", right: 6, top: 6, width: "42%", height: "calc(100% - 12px)", objectFit: "cover", borderRadius: 14 }} />
            </div>
            <div style={{ position: "relative", overflow: "hidden", background: "#e6f4ea", minHeight: 113, display: "flex", alignItems: "center", padding: "18px 20px", border: "1px solid #E5E5E5", borderRadius: 20 }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "#242424" }}>Trading Pro</h4>
                <p style={{ fontSize: 11, color: "#5a657f", margin: "4px 0 8px" }}>Stock & Crypto</p>
                <Link href="/shop?cat=Trading" style={{ fontSize: 11, fontWeight: 700, color: "#2A74ED" }}>Shop Now →</Link>
              </div>
              <img src="/images/mastring stock trading.jpeg" alt="Trading" style={{ position: "absolute", right: 6, top: 6, width: "42%", height: "calc(100% - 12px)", objectFit: "cover", borderRadius: 14 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="ws-section" style={{ background: "#f8f9fb", padding: "28px 0", borderTop: "1px solid #E5E5E5", borderBottom: "1px solid #E5E5E5" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#242424", letterSpacing: "-0.3px" }}>Bestsellers</h2>
            <Link href="/shop?sort=bestseller" style={{ fontSize: 12, fontWeight: 700, color: "#2A74ED", background: "#fff", border: "1px solid #E5E5E5", padding: "6px 12px", borderRadius: 20 }}>View all →</Link>
          </div>
          <div className="p-grid">
            {bestSellers.map((p) => (
              <div key={p.id} className="product-slide"><ProductCard product={p} /></div>
            ))}
          </div>
        </div>
      </section>

      <BestDealSlider />

      {/* Features 4 cols */}
      <section className="ws-section" style={{ background: "#fff", padding: "28px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, textAlign: "center" }}>
            {[
              { icon: <GraduationCap size={20} />, title: "Expert Courses", desc: "Learn from professionals" },
              { icon: <Zap size={20} />, title: "Instant Delivery", desc: "Immediate access" },
              { icon: <Headset size={20} />, title: "24/7 Support", desc: "Round-the-clock help" },
              { icon: <ShieldCheck size={20} />, title: "Secure Payment", desc: "100% secure UPI" },
            ].map((f) => (
              <div key={f.title} style={{ padding: 18, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20 }}>
                <span style={{ width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#eef3ff", color: "#2A74ED", borderRadius: "50%", marginBottom: 10 }}>{f.icon}</span>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#242424", marginBottom: 4, letterSpacing: 0.5 }}>{f.title}</h4>
                <p style={{ fontSize: 11, color: "#777", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#242424", padding: "28px 0", borderRadius: 20, margin: "0 16px" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: "#fff" }}><CountUp value={s.value} suffix={s.suffix} /></div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.7, marginTop: 6, color: "#fff" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="ws-section carousel-area" style={{ background: "#fff", padding: "28px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#242424" }}>New Arrivals</h2>
            <Link href="/shop?sort=newest" style={{ fontSize: 12, fontWeight: 700, color: "#2A74ED", background: "#f8f9fb", border: "1px solid #E5E5E5", padding: "6px 12px", borderRadius: 20 }}>View all →</Link>
          </div>
          <div className="p-grid">
            {newest.map((p) => (
              <div key={p.id} className="product-slide"><ProductCard product={p} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands strip XStore */}
      <section style={{ background: "#f8f9fb", padding: "18px 0", borderTop: "1px solid #E5E5E5", borderBottom: "1px solid #E5E5E5" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", alignItems: "center", justifyContent: "space-between" }}>
            {["EduBazar", "LearnPro", "SkillHub", "CodeLab", "TradeMentor", "DesignForge"].map((b) => (
              <span key={b} style={{ padding: "8px 16px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20, fontSize: 11, fontWeight: 800, color: "#242424", letterSpacing: 0.6, whiteSpace: "nowrap" }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Free tools */}
      {freeStuff.length > 0 && (
        <section className="ws-section" style={{ background: "#fff", padding: "28px 0" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#242424" }}>Free Software & Tools</h2>
              <Link href="/shop?q=free" style={{ fontSize: 12, fontWeight: 700, color: "#2A74ED" }}>View all →</Link>
            </div>
            <div className="p-grid">
              {freeStuff.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials XStore cards rounded */}
      <section className="ws-section" style={{ background: "#f8f9fb", padding: "28px 0", borderTop: "1px solid #E5E5E5" }}>
        <div className="container">
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#242424", textAlign: "center", marginBottom: 18 }}>What Our Students Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20, padding: 18 }}>
                <div style={{ color: "#FFBD3C", display: "flex", gap: 2, marginBottom: 10 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={12} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "#242424", fontStyle: "italic", marginBottom: 12 }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eef3ff", color: "#2A74ED", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, border: "1px solid #E5E5E5" }}>
                    {t.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#242424" }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: "#777" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram rounded */}
      <section className="ws-section-sm" style={{ background: "#fff", padding: "20px 0" }}>
        <div className="container">
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#242424", textAlign: "center", marginBottom: 14 }}>Follow @edubazarshop</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {IG.map((src, i) => (
              <a key={i} href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#f8f9fb", display: "block", borderRadius: 16, border: "1px solid #E5E5E5", padding: 3 }}>
                <img src={src} alt="Instagram" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                <span style={{ position: "absolute", inset: 3, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(42,116,237,0.65)", opacity: 0, transition: "opacity 0.2s", color: "#fff", borderRadius: 12 }} className="ig-hover"><Camera size={18} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter minimal bottom */}
      <section className="ws-section" style={{ background: "#fff", padding: "28px 0", borderTop: "1px solid #E5E5E5" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto", background: "#f8f9fb", border: "1px solid #E5E5E5", borderRadius: 20, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#242424", marginBottom: 6 }}>Subscribe & Get 10% Off</h2>
            <p style={{ fontSize: 12, color: "#777", marginBottom: 16 }}>Get the latest courses, deals & updates straight to your inbox.</p>
            <NewsletterBox />
          </div>
        </div>
      </section>

      <NewsletterPopup />

      <style>{`
        a:hover .ig-hover{ opacity:1 !important; }
        .cat-hover:hover{ border-color:#2A74ED !important; box-shadow:0 4px 16px rgba(42,116,237,0.12); }
        @media (max-width: 1080px){
          .p-grid{ grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px){
          .p-grid{ grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          div[style*="grid-template-columns: 1.4fr 1fr"]{ grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4, 1fr)"]{ grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: repeat(3, 1fr)"]{ grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(6, 1fr)"]{ grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
