"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Phone, Mail, MapPin, Camera, MessageCircle,
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
              India&apos;s affordable online learning platform. Premium courses in Hacking, Programming, Trading & more at prices everyone can afford.
            </p>
            <div className="ws-social-row">
              <a href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={16} strokeWidth={1.5} /></a>
              <a href="https://wa.me/919759131256" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={16} strokeWidth={1.5} /></a>
              <a href="mailto:edubazarshop@gmail.com" aria-label="Email"><Mail size={16} strokeWidth={1.5} /></a>
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
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/refund">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
