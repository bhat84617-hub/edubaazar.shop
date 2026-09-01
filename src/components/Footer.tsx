"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Phone, Mail, MapPin, Camera, MessageCircle, Send, Clock, ShieldCheck, Truck, RotateCcw } from "lucide-react";
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
    showToast("Subscribed! Welcome to EduBazar family.");
    setEmail("");
  };

  return (
    <>
      {/* Newsletter light - accessories style */}
      <section className="ws-newsletter">
        <div className="container">
          <div className="ws-newsletter-inner">
            <div className="ws-newsletter-content">
              <h3>Join Our Newsletter</h3>
              <p>Get updates on new courses & exclusive offers</p>
            </div>
            <form className="ws-newsletter-form" onSubmit={subscribe}>
              <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit"><Send size={16} /> Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Info boxes strip like accessories demo */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e6e6e6" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderRight: "1px solid #f0f0f0" }}>
            <Truck size={32} strokeWidth={1.4} style={{ color: "rgb(46,107,198)" }} />
            <div><strong style={{ fontSize: 13, color: "#333", display: "block" }}>FREE SHIPPING</strong><span style={{ fontSize: 12, color: "#777" }}>On orders over ₹500</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderRight: "1px solid #f0f0f0" }}>
            <RotateCcw size={28} strokeWidth={1.4} style={{ color: "rgb(46,107,198)" }} />
            <div><strong style={{ fontSize: 13, color: "#333", display: "block" }}>MONEY BACK</strong><span style={{ fontSize: 12, color: "#777" }}>30 Days guarantee</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px", borderRight: "1px solid #f0f0f0" }}>
            <ShieldCheck size={28} strokeWidth={1.4} style={{ color: "rgb(46,107,198)" }} />
            <div><strong style={{ fontSize: 13, color: "#333", display: "block" }}>SECURE PAYMENT</strong><span style={{ fontSize: 12, color: "#777" }}>100% Secure UPI</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px" }}>
            <Clock size={28} strokeWidth={1.4} style={{ color: "rgb(46,107,198)" }} />
            <div><strong style={{ fontSize: 13, color: "#333", display: "block" }}>24/7 SUPPORT</strong><span style={{ fontSize: 12, color: "#777" }}>Dedicated support</span></div>
          </div>
        </div>
      </section>

      {/* Main Footer light 5 columns */}
      <footer className="ws-footer">
        <div className="container">
          <div className="ws-footer-top" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1.2fr" }}>
            <div className="ws-footer-col ws-footer-about">
              <div className="ws-footer-logo">
                <img src="/logo/edulogo.jpeg" alt="EduBazar Logo" />
                <span>EduBazar<span style={{ color: "rgb(46,107,198)" }}>.shop</span></span>
              </div>
              <p>India&apos;s affordable online learning platform. Premium courses in Hacking, Programming, Trading & more at prices everyone can afford. Instant access after payment.</p>
              <div className="ws-social-row">
                <a href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={16} /></a>
                <a href="https://wa.me/919759131256" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={16} /></a>
                <a href="mailto:edubazarshop@gmail.com" aria-label="Email"><Mail size={16} /></a>
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
              <ul className="ws-contact-list" style={{ gap: 10 }}>
                <li><MapPin size={16} /><span>India — Online Delivery</span></li>
                <li><Phone size={16} /><span>+91 {STORE.phoneRaw}</span></li>
                <li><Mail size={16} /><span>{STORE.email}</span></li>
                <li><MessageCircle size={16} /><a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a></li>
              </ul>
              <div className="ws-payments-row">
                <span className="ws-pay-chip">UPI</span>
                <span className="ws-pay-chip">GPay</span>
                <span className="ws-pay-chip">PhonePe</span>
                <span className="ws-pay-chip">Paytm</span>
              </div>
            </div>
          </div>

          <div className="ws-footer-bottom">
            <p>&copy; {new Date().getFullYear()} EduBazar.shop. All rights reserved. • Designed with <span style={{ color: "rgb(46,107,198)" }}>WoodMart Accessories</span></p>
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
