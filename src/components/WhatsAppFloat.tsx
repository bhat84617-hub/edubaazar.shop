"use client";

import { useState, useEffect, useRef } from "react";
import { STORE } from "@/lib/config";

const WHATSAPP_NUMBER = STORE.whatsapp;

const PAYMENT_MSG = "Hello EduBazar, I made a payment but haven't received my course yet. My UTR number is: ";
const COURSE_MSG = "Hello EduBazar, I want to know about your courses and pricing.";

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const [glowed, setGlowed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("wa_glow_seen");
    if (!seen) {
      setGlowed(true);
      sessionStorage.setItem("wa_glow_seen", "1");
      const t = setTimeout(() => setGlowed(false), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const waLink = (msg: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  return (
    <div ref={ref} className="wa-float-wrap">
      {open && (
        <div className="wa-float-menu">
          <a
            href={waLink(PAYMENT_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-float-option wa-payment"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Payment Issue</span>
          </a>
          <a
            href={waLink(COURSE_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-float-option wa-course"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span>Course Inquiry</span>
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={`wa-float-btn${glowed ? " wa-glow" : ""}${open ? " wa-active" : ""}`}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="26" height="26" fill="#fff">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.374L1.054 31.25l6.118-1.97C9.772 30.894 12.792 32 16.004 32 24.83 32 32 24.822 32 16S24.83 0 16.004 0zm9.37 22.608c-.39 1.1-1.932 2.014-3.168 2.28-.84.18-1.936.324-5.648-1.212-4.756-1.964-7.812-6.79-8.048-7.104-.226-.314-1.896-2.524-1.896-4.814s1.2-3.41 1.63-3.882c.39-.428.924-.56 1.228-.56.3 0 .604.002.864.016.28.012.654-.106.924.704.274.832.93 2.862 1.01 3.064.08.202.134.438.026.704-.108.266-.202.432-.404.664-.202.232-.404.52-.578.698-.202.202-.412.418-.174.822.238.404 1.06 1.752 2.274 2.84 1.564 1.4 2.88 1.834 3.3 2.034.42.2.666.17.91-.102.244-.272 1.04-1.212 1.32-1.634.278-.422.556-.354.94-.214.388.14 2.468 1.162 2.892 1.374.424.212.706.318.814.494.108.176.108 1.02-.282 2.12z" />
        </svg>
      </button>
    </div>
  );
}
