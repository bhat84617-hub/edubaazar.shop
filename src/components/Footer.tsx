"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Phone, Mail, MapPin, Camera, MessageCircle, Send } from "lucide-react";
import { STORE } from "@/lib/config";
import { CATEGORIES } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function Footer() {
  const pathname = usePathname();
  const { showToast } = useStore();
  const [email, setEmail] = useState("");

  if (pathname.startsWith("/admin")) return null;

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    showToast("Subscribed! Welcome to EduBazar.");
    setEmail("");
  };

  return (
    <>
      {/* Newsletter minimal electronics - light with pill input */}
      <section className="ws-newsletter">
        <div className="container">
          <div className="ws-newsletter-inner">
            <div className="ws-newsletter-content">
              <h3>Join our newsletter</h3>
              <p>Get updates on new courses & exclusive offers — no spam.</p>
            </div>
            <form className="ws-newsletter-form" onSubmit={subscribe}>
              <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit"><Send size={14} /> Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Brands / trust minimal */}
      <section style={{ background: "#fff", borderBottom: "1px solid #E5E5E5" }}>
        <div className="container" style={{ display: "flex", gap: 12, padding: "14px 0", overflowX: "auto", scrollbarWidth: "none", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          {[
            { t: "Free Shipping", d: "Orders over ₹500" },
            { t: "Money Back", d: "30 Days guarantee" },
            { t: "Secure Payment", d: "100% Secure UPI" },
            { t: "24/7 Support", d: "Dedicated help" },
          ].map((b) => (
            <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "#f8f9fb", border: "1px solid #E5E5E5", borderRadius: 20, flex: "1 1 160px", justifyContent: "center" }}>
              <span style={{ width: 8, height: 8, background: "#2A74ED", borderRadius: "50%", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#242424", textTransform: "uppercase", letterSpacing: 0.4 }}>{b.t}</span>
              <span style={{ fontSize: 11, color: "#777" }}>{b.d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Footer minimal light 5 cols with rounded cards */}
      <footer className="ws-footer">
        <div className="container">
          <div className="ws-footer-top" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1.2fr" }}>
            <div className="ws-footer-col ws-footer-about">
              <div className="ws-footer-logo">
                <img src="/logo/edulogo.jpeg" alt="EduBazar Logo" />
                <span>EduBazar<span style={{ color: "#2A74ED" }}>.shop</span></span>
              </div>
              <p>India&apos;s affordable learning platform. Premium courses in Hacking, Programming, Trading & more — instant access after payment.</p>
              <div className="ws-social-row">
                <a href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={14} /></a>
                <a href="https://wa.me/919759131256" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={14} /></a>
                <a href="mailto:edubazarshop@gmail.com" aria-label="Email"><Mail size={14} /></a>
              </div>
            </div>

            <div className="ws-footer-col">
              <h4>Shop</h4>
              <ul>
                <li><Link href="/shop">All Products</Link></li>
                <li><Link href="/shop?kind=course">Courses</Link></li>
                <li><Link href="/shop?kind=book">Digital Books</Link></li>
                <li><Link href="/shop?kind=tool">Software Tools</Link></li>
                <li><Link href="/shop?q=free">Free Downloads</Link></li>
              </ul>
            </div>

            <div className="ws-footer-col">
              <h4>Categories</h4>
              <ul>
                {CATEGORIES.slice(0, 6).map((c) => (
                  <li key={c.key}><Link href={`/shop?cat=${encodeURIComponent(c.key)}`}>{c.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="ws-footer-col">
              <h4>Help</h4>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/refund">Refund Policy</Link></li>
                <li><Link href="/account">My Account</Link></li>
              </ul>
            </div>

            <div className="ws-footer-col">
              <h4>Contact Us</h4>
              <ul className="ws-contact-list" style={{ gap: 8 }}>
                <li><MapPin size={14} /><span>India — Online Delivery</span></li>
                <li><Phone size={14} /><span>+91 {STORE.phoneRaw}</span></li>
                <li><Mail size={14} /><span>{STORE.email}</span></li>
                <li><MessageCircle size={14} /><a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a></li>
              </ul>
              <div className="ws-payments-row">
                <span className="ws-pay-chip">UPI</span>
                <span className="ws-pay-chip">GPay</span>
                <span className="ws-pay-chip">PhonePe</span>
                <span className="ws-pay-chip">Paytm</span>
                <span className="ws-pay-chip">Cards</span>
              </div>
            </div>
          </div>

          <div className="ws-footer-bottom">
            <p>© {new Date().getFullYear()} EduBazar.shop. All rights reserved. • Minimal Electronics by <span style={{ color: "#2A74ED", fontWeight: 700 }}>XStore</span></p>
            <div className="ws-footer-links">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/refund">Refunds</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
