import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Zap, Headset, ShieldCheck, Star, ArrowRight, Camera } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import BestDealSlider from "@/components/BestDealSlider";
import CountUp from "@/components/CountUp";
import NewsletterPopup from "@/components/NewsletterPopup";
import NewsletterBox from "@/components/NewsletterBox";
import { products, CATEGORIES } from "@/lib/products";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";

export const metadata: Metadata = {
  title: "EduBazar.shop — Premium Online Courses from ₹49 | Hacking, Programming, Trading",
  description:
    "India's affordable learning platform. 30+ premium courses in Ethical Hacking, Python, JavaScript, Stock Market & more. Start from ₹49. Lifetime access, certificate, UPI payment, instant delivery.",
  keywords: [
    "online courses India",
    "ethical hacking course",
    "python course",
    "javascript course",
    "stock market course",
    "programming courses cheap",
    "hacking tools",
    "digital marketing course",
    "UI UX design course",
  ],
  alternates: { canonical: SITE },
  openGraph: {
    title: "EduBazar.shop — Premium Online Courses from ₹49",
    description: "30+ courses in Hacking, Programming, Trading & more. Starting at ₹49. Lifetime access.",
    url: SITE,
    type: "website",
    images: [{ url: SITE + "/logo/edulogo.jpeg", width: 512, height: 512, alt: "EduBazar.shop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduBazar.shop — Premium Online Courses from ₹49",
    description: "30+ courses in Hacking, Programming, Trading & more.",
    images: [SITE + "/logo/edulogo.jpeg"],
  },
};

const STATS = [
  { value: 1000, suffix: "+", label: "Happy Students" },
  { value: 1500, suffix: "+", label: "Courses Delivered" },
  { value: 5500, suffix: "+", label: "Downloads" },
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

const homeItemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Featured Courses — EduBazar.shop",
  itemListElement: products
    .filter((p) => p.featured)
    .slice(0, 8)
    .map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/product/${p.slug}`,
      name: p.title,
      image: `${SITE}${p.images[0]}`,
    })),
};

const homeFaqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is EduBazar.shop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "EduBazar.shop is India's affordable online learning platform offering 30+ courses in Ethical Hacking, Programming, Python, JavaScript, Trading, Design and Marketing starting at ₹49 with lifetime access and UPI payment.",
      },
    },
    {
      "@type": "Question",
      name: "How do I get access after payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pay via UPI (Google Pay, PhonePe, Paytm), enter your transaction ID, admin verifies within 24 hours and grants lifetime access in your Dashboard.",
      },
    },
    {
      "@type": "Question",
      name: "Are the courses beginner friendly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we have Beginner, Intermediate and Advanced levels across all categories with hands-on labs and projects.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        EduBazar.shop — Affordable Online Courses in Ethical Hacking, Programming, Trading & More from ₹49
      </h1>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqLd) }} />
      <Hero />

      {/* Telegram promo banner - premium minimal XStore style */}
      <section style={{ background: "#fff", padding: "14px 0 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              background: "#fff",
              border: "1px solid #E5E5E5",
              borderRadius: 20,
              padding: "16px 20px",
              boxShadow: "0 4px 16px rgba(42,116,237,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#2AABEE",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #2AABEE",
                }}
                aria-hidden
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.16 2.71-2.49 2.76-2.7a.2.2 0 00-.05-.18c-.06-.05-.15-.03-.21-.02-.09.02-1.49.95-4.22 2.79a.57.57 0 01-.32.11.6.6 0 01-.46-.22c-.33-.35-.5-.52-.5-.52s-.13-.13-.29-.02c-.16.1-.01.21-.01.21s2.14 1.38 2.88 1.88c.34.23.66.35.94.35.27 0 .54-.12.88-.35 1.02-.7 2.07-1.42 2.68-1.84.3-.21.58-.46.47-.8-.05-.16-.37-.33-1.02-.7z" />
                </svg>
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#242424", letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                  Shop on Telegram
                </div>
                <div style={{ fontSize: 12, color: "#5a657f", lineHeight: 1.4, marginTop: 2 }}>
                  Chat, browse, pay & get instant download
                </div>
              </div>
            </div>
            <a
              href="https://t.me/Edubaazar_bot"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#2A74ED",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid #2A74ED",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Open @Edubaazar_bot
            </a>
          </div>
        </div>
      </section>

      {/* 3 benefits minimal icons - XStore minimal electronics style */}
      <section style={{ background: "#fff", padding: "16px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { icon: <Zap size={18} />, title: "Free Shipping", desc: "On orders over ₹500" },
              { icon: <ShieldCheck size={18} />, title: "Instant Access", desc: "Immediate delivery" },
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
      <section className="stats-strip-wrap" style={{ background: "#242424", padding: "28px 0", borderRadius: 20, margin: "0 16px", overflow: "visible" }}>
        <div className="container stats-strip" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ minWidth: 0, overflow: "visible" }}>
              <div style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 800, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}><CountUp value={s.value} suffix={s.suffix} /></div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.7, marginTop: 6, color: "#fff", wordBreak: "break-word" }}>{s.label}</div>
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
      <section className="ws-section" style={{ background: "#f8f9fb", padding: "28px 0", borderTop: "1px solid #E5E5E5", overflow: "visible" }}>
        <div className="container" style={{ maxWidth: "100%", overflow: "visible" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#242424", textAlign: "center", marginBottom: 18 }}>What Our Students Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, maxWidth: "100%", overflow: "visible" }}>
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

      <NewsletterPopup />

      <style>{`
        a:hover .ig-hover{ opacity:1 !important; }
        .cat-hover:hover{ border-color:#2A74ED !important; box-shadow:0 4px 16px rgba(42,116,237,0.12); }
        .stats-strip-wrap{ box-sizing:border-box; overflow:visible; }
        .stats-strip{ overflow:visible; }
        @media (max-width: 1080px){
          .p-grid{ grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px){
          div[style*="grid-template-columns: repeat(3, 1fr)"]{ grid-template-columns: repeat(2, 1fr) !important; max-width:100%; overflow:visible; }
        }
        @media (max-width: 640px){
          .p-grid{ grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          div[style*="grid-template-columns: 1.4fr 1fr"]{ grid-template-columns: 1fr !important; }
          .stats-strip{ grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; padding: 0 !important; }
          .stats-strip-wrap{ padding: 20px 14px !important; margin: 0 12px !important; }
          div[style*="grid-template-columns: repeat(3, 1fr)"]{ grid-template-columns: 1fr !important; max-width:100%; overflow:visible; }
          div[style*="grid-template-columns: repeat(6, 1fr)"]{ grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px){
          .stats-strip{ grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
        @media (max-width: 360px){
          .stats-strip{ gap: 8px !important; }
        }
      `}</style>
    </>
  );
}
