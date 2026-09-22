"use client";

import { useEffect } from "react";

const SELECTOR = ".ws-btn, .btn, .btn-add, .p-action-btn, .ws-nav-cats-btn, .ws-search-bar-btn, .ws-icon-btn, .hero-cta, .ws-newsletter-form button";

export default function RippleListener() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest(SELECTOR) as HTMLElement | null;
      if (!target) return;
      if (target.matches(":disabled")) return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const span = document.createElement("span");
      span.className = "eb-ripple";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;

      target.appendChild(span);
      window.setTimeout(() => span.remove(), 600);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
