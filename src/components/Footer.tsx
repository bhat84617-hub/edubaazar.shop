"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Phone, Mail, MapPin, Globe, Camera, MessageCircle, Play, Briefcase,
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
    <footer className="ws-footer">
      <div className="container">
        <div className="ws-footer-top">
          <div className="ws-footer-col">
            <div className="ws-footer-logo">
              <img src="/logo/edulogo.jpeg" alt="EduBazar Logo" />
              <span>EduBazar</span>
            </div>
            <p>
              Empowering millions of learners worldwide with world-class
              education, premium digital books and professional tools.
            </p>
            <div className="ws-social-row">
              <a href="#" aria-label="Facebook"><Globe size={16} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Instagram"><Camera size={16} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Twitter"><MessageCircle size={16} strokeWidth={1.5} /></a>
              <a href="#" aria-label="YouTube"><Play size={16} strokeWidth={1.5} /></a>
              <a href="#" aria-label="LinkedIn"><Briefcase size={16} strokeWidth={1.5} /></a>
            </div>
          </div>

          <div className="ws-footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop All</Link></li>
              <li><Link href="/account">My Dashboard</Link></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/compare">Compare</Link></li>
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
            <ul>
              <li className="ws-contact-li"><Phone size={14} strokeWidth={1.5} /> +91 {STORE.phoneRaw}</li>
              <li className="ws-contact-li">
                <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">
                  <span>WhatsApp us</span>
                </a>
              </li>
              <li className="ws-contact-li"><Mail size={14} strokeWidth={1.5} /> {STORE.email}</li>
              <li className="ws-contact-li"><MapPin size={14} strokeWidth={1.5} /> {STORE.address}</li>
            </ul>
            <div className="ws-payments-row">
              <span className="ws-pay-chip">UPI</span>
              <span className="ws-pay-chip">GPay</span>
              <span className="ws-pay-chip">PhonePe</span>
              <span className="ws-pay-chip">Paytm</span>
              <span className="ws-pay-chip">VISA</span>
              <span className="ws-pay-chip">Mastercard</span>
            </div>
          </div>
        </div>

        <div className="ws-footer-bottom">
          <p>&copy; {new Date().getFullYear()} EduBazar.shop. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
