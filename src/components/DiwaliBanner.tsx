"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, X, Copy, Check } from "lucide-react";

// Diwali Dhamaka Sale — seasonal promo strip (auto-hides after 10 Nov 2026)
const SALE_END = new Date("2026-11-10T23:59:59+05:30").getTime();

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function DiwaliBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState("");

  useEffect(() => {
    if (Date.now() > SALE_END) return;
    const tick = () => {
      const ms = SALE_END - Date.now();
      if (ms <= 0) {
        setLeft("");
        return;
      }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(`${d}d : ${pad(h)}h : ${pad(m)}m : ${pad(s)}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Sale over or dismissed → render nothing
  if (dismissed || Date.now() > SALE_END) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText("DIWALI50");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      role="region"
      aria-label="Diwali Dhamaka Sale"
      style={{
        background: "linear-gradient(90deg, #7c2d12 0%, #b45309 35%, #92400e 70%, #7c2d12 100%)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* decorative diyas glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 50%, rgba(255,200,80,.35), transparent 40%), radial-gradient(circle at 88% 50%, rgba(255,200,80,.35), transparent 40%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="container"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "10px 40px 10px 16px",
          textAlign: "center",
        }}
      >
        <Sparkles size={18} style={{ color: "#fcd34d", flexShrink: 0 }} aria-hidden />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px" }}>
          🪔 Diwali Dhamaka Sale — 30+ courses, sirf ₹49 se shuru. Flat 50% off!
        </p>
        <button
          onClick={copyCode}
          title="Coupon code copy karo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,.14)",
            border: "1px dashed rgba(255,255,255,.7)",
            color: "#fff",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "COPIED!" : "DIWALI50"}
        </button>
        {left && (
          <span
            aria-label="Sale countdown"
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(0,0,0,.28)",
              padding: "4px 10px",
              borderRadius: 20,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            ⏳ {left}
          </span>
        )}
        <Link
          href="/shop"
          style={{
            background: "#fff",
            color: "#92400e",
            fontWeight: 800,
            fontSize: 13,
            padding: "6px 16px",
            borderRadius: 20,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Abhi Enroll Karo →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Close sale banner"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,.8)",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
