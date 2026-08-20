"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Code2, TrendingUp, Wrench } from "lucide-react";

const SLIDES = [
  {
    image: "/images/slide1.png",
    icon: <ShieldCheck size={15} />,
    badge: "Trending",
    title: <>Master Ethical<br />Hacking Skills</>,
    desc: "Learn penetration testing, network security & become a certified ethical hacker with 40+ courses.",
    ctaText: "Explore Hacking",
    ctaHref: "/shop?cat=Hacking",
    stats: [
      { n: "40+", l: "Courses" },
      { n: "15K+", l: "Students" },
      { n: "4.8", l: "Rating" },
    ],
  },
  {
    image: "/images/slide2.png",
    icon: <Code2 size={15} />,
    badge: "Popular",
    title: <>Learn to Code<br />Like a Pro</>,
    desc: "Python, JavaScript, React & more. Build real projects and launch your tech career today.",
    ctaText: "Explore Programming",
    ctaHref: "/shop?cat=Programming",
    stats: [
      { n: "10+", l: "Courses" },
      { n: "100K+", l: "Students" },
      { n: "4.9", l: "Rating" },
    ],
  },
  {
    image: "/images/slide3.png",
    icon: <TrendingUp size={15} />,
    badge: "Hot",
    title: <>Stock Market<br />&amp; Crypto Trading</>,
    desc: "Master technical analysis, crypto trading & build profitable strategies from industry experts.",
    ctaText: "Explore Trading",
    ctaHref: "/shop?cat=Trading",
    stats: [
      { n: "8+", l: "Courses" },
      { n: "20K+", l: "Students" },
      { n: "4.7", l: "Rating" },
    ],
  },
  {
    image: "/images/slide4.png",
    icon: <Wrench size={15} />,
    badge: "Free Tools",
    title: <>Software &<br />Hacking Tools</>,
    desc: "Premium RATs, payload generators & analysis tools. Most are FREE to download.",
    ctaText: "Explore Tools",
    ctaHref: "/shop?cat=Tools",
    stats: [
      { n: "15+", l: "Tools" },
      { n: "30K+", l: "Downloads" },
      { n: "4.7", l: "Rating" },
    ],
  },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero">
      <div className="hero-slides">
        {SLIDES.map((s, i) => (
          <div key={i} className={`hero-slide ${i === idx ? "active" : ""}`}>
            <img src={s.image} alt="" className="bg-img" aria-hidden />
            <div className="container">
              <div className="hero-content">
                <span className="hero-badge">{s.icon} {s.badge}</span>
                <h1>{s.title}</h1>
                <p>{s.desc}</p>
                <div className="hero-btns">
                  <Link href={s.ctaHref} className="btn btn-accent">
                    {s.ctaText} <ArrowRight size={16} />
                  </Link>
                  <Link href="/shop" className="btn btn-light-outline">
                    View Courses
                  </Link>
                </div>
                <div className="hero-stats">
                  {s.stats.map((st) => (
                    <div key={st.l}>
                      <strong>{st.n}</strong>
                      <span>{st.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
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