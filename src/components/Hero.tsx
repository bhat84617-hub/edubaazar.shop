"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, products } from "@/lib/products";

const SLIDES = [
  {
    image: "/images/hackingslide.png",
    alt: "Ethical hacking course hero",
    eyebrow: "Limited Edition",
    title: "Master Ethical\nHacking & Security",
    desc: "Learn penetration testing, network security & become a certified ethical hacker with 35+ hands-on labs.",
    price: "From ₹199",
    ctaText: "Shop Now",
    ctaHref: "/shop?cat=Hacking",
    bg: "#eef3ff",
    accent: "#2A74ED",
  },
  {
    image: "/images/programming-hero-section.jpeg",
    alt: "Programming courses",
    eyebrow: "New Arrivals",
    title: "Code Like a\nPro Developer",
    desc: "Python, JavaScript, React & more. Build real projects and launch your tech career today.",
    price: "From ₹199",
    ctaText: "Shop Now",
    ctaHref: "/shop?cat=Programming",
    bg: "#fef6e8",
    accent: "#FF515C",
  },
  {
    image: "/images/trading-hero-section.jpeg",
    alt: "Trading courses",
    eyebrow: "Best Seller",
    title: "Stock Market &\nTrading Mastery",
    desc: "Master technical analysis, crypto trading & build profitable strategies with pro traders.",
    price: "From ₹249",
    ctaText: "Shop Now",
    ctaHref: "/shop?cat=Trading",
    bg: "#e6f4ea",
    accent: "#459647",
  },
];

const MOBILE_SLIDES = [
  { image: "/images/phoneslidehacking.jpeg", alt: "Hacking", title: "Hacking", href: "/shop?cat=Hacking" },
  { image: "/images/phoneslideprogramming.jpeg", alt: "Programming", title: "Programming", href: "/shop?cat=Programming" },
  { image: "/images/phoneslidetrading.jpeg", alt: "Trading", title: "Trading", href: "/shop?cat=Trading" },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[idx];

  return (
    <section style={{ background: "#fff", padding: "14px 0 8px" }}>
      <div className="container hero-layout">
        {/* Side categories vertical nav - desktop */}
        <aside className="hero-cats">
          <div className="hero-cats-head">
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: "#242424" }}>All Categories</span>
            <span style={{ fontSize: 11, color: "#777", fontWeight: 600 }}>{products.length} products</span>
          </div>
          <nav className="hero-cats-list">
            {CATEGORIES.map((c) => {
              const count = products.filter((p) => p.category === c.key).length;
              return (
                <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} className="hero-cat-item">
                  <span className="hero-cat-thumb">
                    <img src={c.image} alt={c.label} />
                  </span>
                  <span className="hero-cat-label">{c.label}</span>
                  <span className="hero-cat-count">{count}</span>
                </Link>
              );
            })}
            <Link href="/shop" className="hero-cat-item hero-cat-all">
              All Products →
            </Link>
          </nav>
        </aside>

        {/* Slider column */}
        <div className="hero-slider-col">
          {/* Desktop Slider */}
          <div className="desktop-hero">
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background: s.bg,
                border: "1px solid #E5E5E5",
                borderRadius: 20,
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                transition: "background 0.4s linear",
              }}
            >
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    alignItems: "center",
                    opacity: i === idx ? 1 : 0,
                    transform: i === idx ? "translateX(0)" : "translateX(14px)",
                    transition: "all 0.45s linear",
                    pointerEvents: i === idx ? "auto" : "none",
                    padding: "28px 36px",
                    gap: 20,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: slide.accent, background: "#fff", padding: "4px 10px", borderRadius: 20, border: "1px solid #E5E5E5", display: "inline-flex" }}>{slide.eyebrow}</span>
                    <h2 style={{ fontSize: "clamp(22px, 3.2vw, 34px)", fontWeight: 800, color: "#242424", lineHeight: 1.1, margin: "12px 0 10px", whiteSpace: "pre-line", letterSpacing: "-0.6px" }}>
                      {slide.title.split("\n")[0]} <span style={{ color: "#2A74ED" }}>{slide.title.split("\n")[1] ?? ""}</span>
                    </h2>
                    <p style={{ fontSize: 13, color: "#5a657f", lineHeight: 1.6, marginBottom: 14, maxWidth: 400 }}>{slide.desc}</p>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#2A74ED", marginBottom: 16, letterSpacing: "-0.3px" }}>{slide.price}</div>
                    <Link
                      href={slide.ctaHref}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "11px 22px",
                        background: "#2A74ED",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 20,
                        transition: "all 0.2s linear",
                      }}
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 20, padding: 6, boxShadow: "0 8px 28px rgba(0,0,0,0.08)", maxWidth: 380, width: "100%" }}>
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 16, display: "block" }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setIdx((idx - 1 + SLIDES.length) % SLIDES.length)}
                aria-label="Previous"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "1px solid #E5E5E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 2,
                  color: "#242424",
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setIdx((idx + 1) % SLIDES.length)}
                aria-label="Next"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "1px solid #E5E5E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 2,
                  color: "#242424",
                }}
              >
                <ChevronRight size={15} />
              </button>

              <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 2 }}>
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Slide ${i + 1}`}
                    style={{
                      width: i === idx ? 20 : 8,
                      height: 8,
                      borderRadius: 20,
                      background: i === idx ? "#2A74ED" : "#fff",
                      border: i === idx ? "1px solid #2A74ED" : "1px solid #E5E5E5",
                      transition: "all 0.2s linear",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Slider */}
          <div className="mobile-hero" style={{ padding: 0 }}>
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, border: "1px solid #E5E5E5" }}>
              {MOBILE_SLIDES.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: i === idx ? "block" : "none",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <img src={m.image} alt={m.alt} style={{ width: "100%", height: "auto", display: "block", borderRadius: 20 }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.45))", borderRadius: 20, textAlign: "center", padding: 16 }}>
                    <h2 style={{ color: "#fff", fontSize: "clamp(28px, 8vw, 38px)", fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 14px", textShadow: "0 2px 12px rgba(0,0,0,0.35)", textTransform: "capitalize" }}>{m.title}</h2>
                    <Link href={m.href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 22px", background: "#2A74ED", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 20, textDecoration: "none" }}>Explore Now</Link>
                  </div>
                </div>
              ))}
              <button onClick={() => setIdx((idx - 1 + MOBILE_SLIDES.length) % MOBILE_SLIDES.length)} aria-label="Previous" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", color: "#242424" }}><ChevronLeft size={14} /></button>
              <button onClick={() => setIdx((idx + 1) % MOBILE_SLIDES.length)} aria-label="Next" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", color: "#242424" }}><ChevronRight size={14} /></button>
              <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                {MOBILE_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} style={{ width: i === idx ? 18 : 8, height: 8, borderRadius: 20, background: i === idx ? "#2A74ED" : "rgba(255,255,255,0.9)", border: "1px solid #E5E5E5" }} />
                ))}
              </div>
            </div>
            {/* Mobile categories quick links */}
            <div className="hero-cats-mobile">
              {CATEGORIES.map((c) => {
                const count = products.filter((p) => p.category === c.key).length;
                return (
                  <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} className="hero-cat-mobile-item">
                    <span className="hero-cat-thumb" style={{ width: 36, height: 36 }}><img src={c.image} alt={c.label} /></span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#242424" }}>{c.label}</span>
                    <span style={{ fontSize: 10, color: "#777" }}>{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-layout{ display:grid; grid-template-columns: 270px 1fr; gap:16px; align-items:start; }
        .hero-cats{ background:#fff; border:1px solid #E5E5E5; border-radius:20px; overflow:hidden; }
        .hero-cats-head{ display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:#f8f9fb; border-bottom:1px solid #E5E5E5; }
        .hero-cats-list{ display:flex; flex-direction:column; padding:6px; gap:2px; }
        .hero-cat-item{ display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px; transition:all 0.15s linear; }
        .hero-cat-item:hover{ background:#eef3ff; }
        .hero-cat-thumb{ width:32px; height:32px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#f3f5f9; border:1px solid #E5E5E5; display:flex; }
        .hero-cat-thumb img{ width:100%; height:100%; object-fit:cover; }
        .hero-cat-label{ font-size:13px; fontWeight:600; color:#242424; flex:1; }
        .hero-cat-item:hover .hero-cat-label{ color:#2A74ED; }
        .hero-cat-count{ font-size:11px; color:#777; background:#f8f9fb; border:1px solid #E5E5E5; padding:2px 8px; border-radius:20px; fontWeight:700; }
        .hero-cat-all{ justify-content:center; fontWeight:700; color:#2A74ED; border-top:1px solid #E5E5E5; margin-top:6px; padding-top:12px; border-radius:0; }
        .hero-cats-mobile{ display:none; gap:8px; overflow-x:auto; padding:12px 2px 4px; scrollbar-width:none; }
        .hero-cats-mobile::-webkit-scrollbar{ display:none; }
        .hero-cat-mobile-item{ display:flex; flex-direction:column; align-items:center; gap:4px; min-width:72px; flex:0 0 auto; background:#fff; border:1px solid #E5E5E5; borderRadius:16px; padding:10px 8px; }
        .mobile-hero{ display:none; }
        .desktop-hero{ display:block; }
        @media (max-width: 1024px){
          .hero-layout{ grid-template-columns:1fr; }
          .hero-cats{ display:none; }
        }
        @media (max-width: 768px){
          .desktop-hero{ display:none !important; }
          .mobile-hero{ display:block !important; }
          .hero-cats-mobile{ display:flex; }
          .hero-layout{ gap:0; }
        }
        @media (min-width: 769px){
          .mobile-hero{ display:none !important; }
        }
      `}</style>
    </section>
  );
}
