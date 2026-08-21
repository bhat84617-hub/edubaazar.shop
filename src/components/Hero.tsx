"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    image: "/images/hackingslide.png",
    title: "Master Ethical\nHacking Skills",
    desc: "Learn penetration testing, network security & become a certified ethical hacker.",
    ctaText: "Explore Hacking",
    ctaHref: "/shop?cat=Hacking",
  },
  {
    image: "/images/programingslide.png",
    title: "Learn to Code\nLike a Pro",
    desc: "Python, JavaScript, React & more. Build real projects and launch your tech career.",
    ctaText: "Explore Programming",
    ctaHref: "/shop?cat=Programming",
  },
  {
    image: "/images/tradingslide.png",
    title: "Stock Market &\nCrypto Trading",
    desc: "Master technical analysis, crypto trading & build profitable strategies.",
    ctaText: "Explore Trading",
    ctaHref: "/shop?cat=Trading",
  },
  {
    image: "/images/softwaresslide.png",
    title: "Software &\nHacking Tools",
    desc: "Premium RATs, payload generators & analysis tools. Most are FREE to download.",
    ctaText: "Explore Tools",
    ctaHref: "/shop?cat=Tools",
  },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[idx];

  return (
    <section className="ws-hero">
      {/* Background image with crossfade */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`ws-hero-bg ${i === idx ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}
      <div className="ws-hero-overlay" />

      <div className="ws-hero-content container">
        <div className="ws-hero-text">
          <h1>{s.title}</h1>
          <p className="ws-hero-desc">{s.desc}</p>
          <Link href={s.ctaHref} className="ws-btn ws-btn-hero">
            {s.ctaText} <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <div className="ws-hero-nav">
        <button onClick={() => setIdx((idx - 1 + SLIDES.length) % SLIDES.length)} aria-label="Previous">
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="ws-hero-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={i === idx ? "active" : ""}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={() => setIdx((idx + 1) % SLIDES.length)} aria-label="Next">
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
