"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[idx];

  return (
    <section style={{ background: "#fff", padding: "14px 0 8px" }}>
      <div className="container">
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

      <style>{`
        @media (max-width: 768px){
          div[style*="grid-template-columns: 1fr 1fr"]{ grid-template-columns:1fr !important; text-align:center; }
          div[style*="grid-template-columns: 1fr 1fr"] > div:last-child{ display:none !important; }
        }
      `}</style>
    </section>
  );
}
