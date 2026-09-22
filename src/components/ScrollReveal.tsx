"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Direction = "up" | "left" | "right" | "zoom";

interface ScrollRevealProps {
  children: ReactNode;
  as?: ElementType;
  direction?: Direction;
  delay?: number;
  stagger?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollReveal({
  children,
  as: Tag = "div",
  direction = "up",
  delay = 0,
  stagger = false,
  className = "",
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const classes = [
    stagger ? "eb-stagger" : "eb-reveal",
    stagger ? "" : `eb-${direction}`,
    visible ? "eb-visible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: React.CSSProperties = {
    ...(style ?? {}),
    ...(delay ? { transitionDelay: `${delay}ms` } : {}),
  };

  return (
    <Tag ref={ref as never} className={classes} style={Object.keys(mergedStyle).length ? mergedStyle : undefined}>
      {children}
    </Tag>
  );
}
