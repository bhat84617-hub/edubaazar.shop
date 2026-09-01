"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Phone, Mail, MapPin, Camera, MessageCircle, Send,
} from "lucide-react";
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
      {/* Newsletter Section - WoodMart style */}
      <section className="ws-newsletter">
        <div className="container">
          <div className="ws-newsletter-inner">
            <div className="ws-newsletter-content">
              <h3>Subscribe to Our Newsletter</h3>
              <p>Get updates on new courses, special offers and exclusive deals</p>
            </div>
            <form className="ws-newsletter-form" onSubmit={subscribe}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                <Send size={18} />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="ws-footer">
        <div className="container">
          <div className="ws-footer-top">
            <div className="ws-footer-col ws-footer-about">
              <div className="ws-footer-logo">
                <img src="/logo/edulogo.jpeg" alt="EduBazar Logo" />
                <span>EduBazar</span>
              </div>
              <p>
                India&apos;s affordable online learning platform. Premium courses in Hacking, Programming, Trading & more at prices everyone can afford.
              </p>
              <div className="ws-social-row">
                <a href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={18} /></a>
                <a href="https://wa.me/919759131256" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
                <a href="mailto:edubazarshop@gmail.com" aria-label="Email"><Mail size={18} /></a>
              </div>
            </div>

            <div className="ws-footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/shop">Shop All</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/account">My Dashboard</Link></li>
              </ul>
            </div>

            <div className="ws-footer-col">
              <h4>Categories</h4>
              <ul>
                {CATEGORIES.map((c) => (
                  <li key={c.key}>
                    <Link href={`/shop?cat=${encodeURIComponent(c.key)}`}>{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ws-footer-col">
              <h4>Contact Info</h4>
              <ul className="ws-contact-list">
                <li>
                  <Phone size={16} />
                  <span>+91 {STORE.phoneRaw}</span>
                </li>
                <li>
                  <MessageCircle size={16} />
                  <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">
                    WhatsApp us
                  </a>
                </li>
                <li>
                  <Mail size={16} />
                  <span>{STORE.email}</span>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>{STORE.address}</span>
                </li>
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
            <p>&copy; {new Date().getFullYear()} EduBazar.shop. All rights reserved.</p>
            <div className="ws-footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/refund">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
