"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Code2, TrendingUp, Wrench } from "lucide-react";

const SLIDES = [
  {
    image: "/images/slide1.png",
    badge: "Trending",
    title: <>Master Ethical Hacking Skills</>,
    desc: "Learn penetration testing, network security & become a certified ethical hacker with 40+ courses.",
    ctaText: "Explore Hacking",
    ctaHref: "/shop?cat=Hacking",
  },
  {
    image: "/images/slide2.png",
    badge: "Popular",
    title: <>Learn to Code Like a Pro</>,
    desc: "Python, JavaScript, React & more. Build real projects and launch your tech career today.",
    ctaText: "Explore Programming",
    ctaHref: "/shop?cat=Programming",
  },
  {
    image: "/images/slide3.png",
    badge: "Hot",
    title: <>Stock Market & Crypto Trading</>,
    desc: "Master technical analysis, crypto trading & build profitable strategies from industry experts.",
    ctaText: "Explore Trading",
    ctaHref: "/shop?cat=Trading",
  },
  {
    image: "/images/slide4.png",
    badge: "Free Tools",
    title: <>Software & Hacking Tools</>,
    desc: "Premium RATs, payload generators & analysis tools. Most are FREE to download.",
    ctaText: "Explore Tools",
    ctaHref: "/shop?cat=Tools",
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
    <section className="hero">
      <div className="hero-editorial">
        <div className="hero-left">
          <span className="hero-badge">{s.badge}</span>
          <h1>{s.title}</h1>
          <div className="hero-divider" />
          <p>{s.desc}</p>
          <Link href={s.ctaHref} className="text-btn">
            {s.ctaText} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="hero-right">
          <img src={s.image} alt={s.title?.toString()} />
        </div>
      </div>

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={i === idx ? "active" : ""}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
      <div className="hero-controls">
        <button onClick={() => setIdx((idx - 1 + SLIDES.length) % SLIDES.length)} aria-label="Previous">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setIdx((idx + 1) % SLIDES.length)} aria-label="Next">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
