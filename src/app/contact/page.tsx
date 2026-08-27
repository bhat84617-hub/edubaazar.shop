import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageCircle, Mail, Phone, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with EduBazar.shop. WhatsApp, email, or DM us for course queries, payment issues, or support. We respond within 24 hours.",
  keywords: ["contact EduBazar", "EduBazar support", "course help India", "UPI payment issue"],
  alternates: { canonical: "https://www.edubaazar.shop/contact" },
  openGraph: { title: "Contact EduBazar.shop", description: "Get in touch for course queries, payment issues, or support." },
};

export default function ContactPage() {
  return (
    <div>
      <div style={{ background: "var(--primary-dark)", color: "#fff", padding: "38px 0 30px" }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            <Link href="/">Home</Link> <ChevronRight size={13} /> <span style={{ color: "var(--accent)" }}>Contact Us</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,40px)" }}>Contact Us</h1>
        </div>
      </div>

      <section className="section-pad">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="dash-panel" style={{ padding: 40 }}>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--muted)", marginBottom: 30 }}>
              Have a question about a course? Facing payment issues? Need help with your order? We&apos;re here to help. Reach out through any of these channels:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <a href="https://wa.me/919759131256" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--soft)", borderRadius: 12, textDecoration: "none", color: "var(--body)", transition: "all 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><MessageCircle size={24} /></div>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 2 }}>WhatsApp</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>9759131256 — Fastest response, usually within minutes</p>
                </div>
              </a>

              <a href="mailto:edubazarshop@gmail.com" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--soft)", borderRadius: 12, textDecoration: "none", color: "var(--body)", transition: "all 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Mail size={24} /></div>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 2 }}>Email</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>edubazarshop@gmail.com — Response within 24 hours</p>
                </div>
              </a>

              <a href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--soft)", borderRadius: 12, textDecoration: "none", color: "var(--body)", transition: "all 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Camera size={24} /></div>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 2 }}>Instagram</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>@edubazarshop — DM us for quick queries</p>
                </div>
              </a>

              <a href="tel:+919759131256" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--soft)", borderRadius: 12, textDecoration: "none", color: "var(--body)", transition: "all 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Phone size={24} /></div>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 2 }}>Phone / Call</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>+91 9759131256 — Mon-Sat, 10 AM to 8 PM</p>
                </div>
              </a>
            </div>

            <div style={{ marginTop: 30, padding: 20, background: "var(--soft)", borderRadius: 12 }}>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Common Issues</h3>
              <ul style={{ fontSize: 14, color: "var(--muted)", lineHeight: 2, paddingLeft: 20 }}>
                <li><strong>Payment not verified?</strong> Share your UTR number on WhatsApp and we&apos;ll check immediately.</li>
                <li><strong>Course not downloading?</strong> Check your email for the download link or contact us on WhatsApp.</li>
                <li><strong>Want a refund?</strong> Contact us within 24 hours of purchase. See our <Link href="/refund" style={{ color: "var(--primary)" }}>Refund Policy</Link>.</li>
                <li><strong>Want to buy in bulk?</strong> We offer special discounts for groups. WhatsApp us for details.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
