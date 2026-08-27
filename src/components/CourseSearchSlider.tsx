"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Clock, Signal, Star } from "lucide-react";
import { products, formatINR } from "@/lib/products";

export default function CourseSearchSlider() {
  const [query, setQuery] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.desc.toLowerCase().includes(query.toLowerCase())
      )
    : products.slice(0, 12);

  const scroll = (dir: number) => {
    if (!trackRef.current) return;
    const amount = 300;
    trackRef.current.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="ws-search-slider-section">
      <div className="container">
        <div className="ws-search-bar">
          <Search size={18} strokeWidth={1.5} className="ws-search-bar-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, books, tools..."
            className="ws-search-bar-input"
          />
          {query && (
            <button className="ws-search-bar-clear" onClick={() => setQuery("")}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="ws-search-slider-wrap">
        <button className="ws-slider-arrow ws-slider-prev" onClick={() => scroll(-1)} aria-label="Previous">
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>

        <div className="ws-search-slider-track" ref={trackRef}>
          {filtered.length === 0 ? (
            <div className="ws-search-empty">No courses found for &ldquo;{query}&rdquo;</div>
          ) : (
            filtered.map((p) => {
              const free = p.price <= 0;
              return (
                <Link key={p.id} href={`/product/${p.slug}`} className="ws-search-slide">
                  <div className="ws-search-slide-img">
                    <img src={p.images[0]} alt={p.title} loading="lazy" />
                    {p.badge && <span className={`ws-search-slide-badge ${p.badge.toLowerCase()}`}>{p.badge}</span>}
                  </div>
                  <div className="ws-search-slide-body">
                    <span className="ws-search-slide-cat">{p.category}</span>
                    <h4 className="ws-search-slide-title">{p.title}</h4>
                    <div className="ws-search-slide-meta">
                      <span><Clock size={12} /> {p.duration}</span>
                      <span><Signal size={12} /> {p.level}</span>
                    </div>
                    <div className="ws-search-slide-footer">
                      <div className="ws-search-slide-prices">
                        {!free && p.oldPrice > 0 && <span className="ws-search-slide-old">{formatINR(p.oldPrice)}</span>}
                        <span className={`ws-search-slide-new ${free ? "free" : ""}`}>
                          {free ? "FREE" : formatINR(p.price)}
                        </span>
                      </div>
                      <div className="ws-search-slide-stars">
                        <Star size={12} style={{ color: "#f5a623", fill: "#f5a623" }} />
                        <span>{p.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <button className="ws-slider-arrow ws-slider-next" onClick={() => scroll(1)} aria-label="Next">
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
