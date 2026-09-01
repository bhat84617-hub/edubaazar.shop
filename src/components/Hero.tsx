"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/products";

const SLIDES = [
  {
    image: "/images/hackingslide.png",
    alt: "Ethical hacking and penetration testing course hero",
    subtitle: "Limited Edition",
    title: "Master Ethical Hacking",
    desc: "Learn penetration testing, network security & become a certified ethical hacker with hands-on labs.",
    price: "From ₹199",
    ctaText: "Shop Now",
    ctaHref: "/shop?cat=Hacking",
    bg: "#eef3fb",
  },
  {
    image: "/images/programming-hero-section.jpeg",
    alt: "Programming courses with Python, JavaScript and React",
    subtitle: "New Arrivals",
    title: "Learn to Code Like a Pro",
    desc: "Python, JavaScript, React & more. Build real projects and launch your tech career today.",
    price: "From ₹199",
    ctaText: "Shop Now",
    ctaHref: "/shop?cat=Programming",
    bg: "#fef6e8",
  },
  {
    image: "/images/trading-hero-section.jpeg",
    alt: "Stock market and crypto trading courses",
    subtitle: "Best Seller",
    title: "Stock Market & Trading",
    desc: "Master technical analysis, crypto trading & build profitable strategies with pro traders.",
    price: "From ₹249",
    ctaText: "Shop Now",
    ctaHref: "/shop?cat=Trading",
    bg: "#e8f5f0",
  },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[idx];

  return (
    <section style={{ background: "#f8f8f8", padding: "20px 0" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "stretch" }}>
        {/* Left categories vertical nav - WoodMart accessories style */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e6e6e6",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          className="hero-cats"
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e6e6e6", display: "flex", alignItems: "center", gap: 10, background: "#fff" }}>
            <div style={{ width: 20, height: 14, display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ height: 2, background: "#333", borderRadius: 1 }} />
              <span style={{ height: 2, background: "#333", borderRadius: 1 }} />
              <span style={{ height: 2, background: "#333", borderRadius: 1 }} />
            </div>
            <strong style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#333" }}>All Categories</strong>
          </div>
          <nav style={{ flex: 1, padding: "8px 0" }}>
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={`/shop?cat=${encodeURIComponent(c.key)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 18px",
                  fontSize: 14,
                  color: "#333",
                  borderLeft: "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
                className="hero-cat-link"
              >
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#f5f7fb", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  <img src={c.image} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </span>
                <span style={{ flex: 1, fontWeight: 500 }}>{c.label}</span>
                <span style={{ fontSize: 12, color: "#bbb" }}>›</span>
              </Link>
            ))}
            <Link
              href="/shop"
              style={{
                display: "block",
                margin: "10px 18px 0",
                padding: "10px",
                textAlign: "center",
                background: "rgb(46,107,198)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.3,
              }}
            >
              View All →
            </Link>
          </nav>
        </div>

        {/* Right slider */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: s.bg,
            border: "1px solid #e6e6e6",
            minHeight: 420,
            display: "flex",
            alignItems: "center",
          }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                alignItems: "center",
                opacity: i === idx ? 1 : 0,
                transform: i === idx ? "translateX(0)" : "translateX(20px)",
                transition: "all 0.5s ease",
                pointerEvents: i === idx ? "auto" : "none",
                padding: "30px 40px",
                gap: 20,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "rgb(46,107,198)" }}>{slide.subtitle}</span>
                <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#212121", lineHeight: 1.15, margin: "8px 0 12px", whiteSpace: "pre-line" }}>{slide.title}</h2>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 16, maxWidth: 420 }}>{slide.desc}</p>
                <div style={{ fontSize: 18, fontWeight: 700, color: "rgb(46,107,198)", marginBottom: 18 }}>{slide.price}</div>
                <Link
                  href={slide.ctaHref}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 28px",
                    background: "rgb(46,107,198)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    transition: "background 0.2s",
                  }}
                >
                  {slide.ctaText}
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <img
                  src={slide.image}
                  alt={slide.alt}
                  style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 4 }}
                />
              </div>
            </div>
          ))}

          {/* Controls */}
          <button
            onClick={() => setIdx((idx - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Previous"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #e6e6e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 2,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setIdx((idx + 1) % SLIDES.length)}
            aria-label="Next"
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #e6e6e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 2,
            }}
          >
            <ChevronRight size={16} />
          </button>

          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 2 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === idx ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === idx ? "rgb(46,107,198)" : "#d0d0d0",
                  border: "none",
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hero-cat-link:hover{ background:#f9f9f9 !important; border-left-color: rgb(46,107,198) !important; color: rgb(46,107,198) !important; padding-left:22px !important; }
        @media (max-width: 900px){
          div.container{ grid-template-columns:1fr !important; }
          .hero-cats{ display:none !important; }
        }
        @media (max-width: 640px){
          div[style*="grid-template-columns: 1.1fr"]{ grid-template-columns:1fr !important; text-align:center; }
          div[style*="grid-template-columns: 1.1fr"] > div:last-child{ display:none !important; }
        }
      `}</style>
    </section>
  );
}
