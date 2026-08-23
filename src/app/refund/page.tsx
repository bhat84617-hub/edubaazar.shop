import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy — EduBazar.shop",
  description: "EduBazar.shop refund policy for courses, e-books, and digital tools. Learn how to request a refund for your purchase.",
  keywords: ["EduBazar refund", "course refund policy", "money back guarantee", "digital product refund", "UPI refund"],
  openGraph: {
    title: "Refund Policy — EduBazar.shop",
    description: "EduBazar.shop refund policy for courses, e-books, and digital tools.",
    url: "https://edubaazar.shop/refund",
  },
  alternates: { canonical: "https://edubaazar.shop/refund" },
};

export default function RefundPage() {
  return (
    <div>
      <div style={{ background: "var(--primary-dark)", color: "#fff", padding: "38px 0 30px" }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            <Link href="/">Home</Link> <ChevronRight size={13} /> <span style={{ color: "var(--accent)" }}>Refund Policy</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,40px)" }}>Refund Policy</h1>
        </div>
      </div>
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="dash-panel" style={{ padding: 40 }}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Last updated: August 2026</p>

            <div style={{ padding: 16, background: "rgba(17,70,57,0.06)", borderRadius: 8, borderLeft: "3px solid var(--primary)", marginBottom: 24 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--primary)", margin: 0 }}>
                Since our products are digital, our refund policy has specific conditions. Please read carefully before purchasing.
              </p>
            </div>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>1. Eligible for Refund</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 12 }}>You are eligible for a full refund if:</p>
            <ul style={{ fontSize: 15, lineHeight: 2, color: "var(--muted)", marginBottom: 20, paddingLeft: 20 }}>
              <li>You request a refund within <strong>24 hours</strong> of purchase</li>
              <li>The course content is significantly different from what was described on the product page</li>
              <li>You made a duplicate payment by mistake</li>
              <li>The download link is broken and we cannot fix it within 48 hours</li>
            </ul>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>2. Not Eligible for Refund</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 12 }}>Refunds will NOT be provided if:</p>
            <ul style={{ fontSize: 15, lineHeight: 2, color: "var(--muted)", marginBottom: 20, paddingLeft: 20 }}>
              <li>You have already downloaded the course content</li>
              <li>The request is made after 24 hours of purchase</li>
              <li>You changed your mind about buying the course</li>
              <li>You share your account or download links with others</li>
              <li>The course was purchased during a sale or with a coupon code</li>
            </ul>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>3. How to Request a Refund</h2>
            <ol style={{ fontSize: 15, lineHeight: 2, color: "var(--muted)", marginBottom: 20, paddingLeft: 20 }}>
              <li>WhatsApp us at <a href="https://wa.me/919759131256" style={{ color: "var(--primary)" }}>9759131256</a> with your Order ID</li>
              <li>Or email us at <a href="mailto:edubazarshop@gmail.com" style={{ color: "var(--primary)" }}>edubazarshop@gmail.com</a></li>
              <li>Mention your Order ID and reason for refund</li>
              <li>We will review and respond within 48 hours</li>
              <li>If approved, refund will be processed to your UPI account within 3-5 business days</li>
            </ol>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>4. Free Products</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              Free products are not eligible for refunds as no payment was made. However, if you face issues accessing a free product, please contact us and we will resolve it immediately.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>5. Contact for Refunds</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)" }}>
              For any refund-related queries, contact us at <a href="mailto:edubazarshop@gmail.com" style={{ color: "var(--primary)" }}>edubazarshop@gmail.com</a> or WhatsApp at <a href="https://wa.me/919759131256" style={{ color: "var(--primary)" }}>9759131256</a>. We aim to resolve all refund requests within 48 hours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
