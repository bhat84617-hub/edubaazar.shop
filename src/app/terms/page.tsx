import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — EduBazar.shop",
  description: "Terms and conditions for using EduBazar.shop. Read our policies on purchases, access, intellectual property, and more.",
  keywords: ["EduBazar terms", "online course terms", "digital product policy", "UPI payment terms", "course access policy"],
  openGraph: {
    title: "Terms & Conditions — EduBazar.shop",
    description: "Read our terms and conditions for purchases, access, intellectual property, and more.",
    url: "https://edubaazar.shop/terms",
  },
  alternates: { canonical: "https://edubaazar.shop/terms" },
};

export default function TermsPage() {
  return (
    <div>
      <div style={{ background: "var(--primary-dark)", color: "#fff", padding: "38px 0 30px" }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            <Link href="/">Home</Link> <ChevronRight size={13} /> <span style={{ color: "var(--accent)" }}>Terms & Conditions</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,40px)" }}>Terms & Conditions</h1>
        </div>
      </div>
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="dash-panel" style={{ padding: 40 }}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Last updated: August 2026</p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>1. Acceptance of Terms</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              By accessing or using EduBazar.shop, you agree to be bound by these Terms & Conditions. If you do not agree with any part, please do not use our website.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>2. Products & Services</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              EduBazar.shop sells digital products including online courses, e-books, and software tools. All products are delivered digitally. No physical items are shipped. Product prices are listed in Indian Rupees (INR) and include all applicable taxes.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>3. Payments</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              We accept payments via UPI (Google Pay, PhonePe, Paytm, or any UPI app). After making a payment, you must enter your UPI Transaction ID (UTR) for verification. Our team verifies payments manually and grants access within 24 hours. Free products are accessible immediately without payment.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>4. Product Access</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              Once your payment is verified, you receive lifetime access to the purchased course(s). Access is granted through downloadable links or your account dashboard. You may not share, redistribute, or resell the downloaded content.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>5. Intellectual Property</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              All course content, e-books, software tools, logos, and branding on EduBazar.shop are the intellectual property of their respective creators and EduBazar.shop. You are granted a personal, non-transferable license to use the content for educational purposes only.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>6. User Accounts</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              You are responsible for maintaining the confidentiality of your account credentials. Do not share your account with others. EduBazar.shop reserves the right to suspend accounts that violate these terms.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>7. Limitation of Liability</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              EduBazar.shop provides educational content &quot;as is&quot;. We do not guarantee specific outcomes from using our courses. Our liability is limited to the amount you paid for the product.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>8. Changes to Terms</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              We may update these terms from time to time. Continued use of the website after changes constitutes acceptance of the new terms.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>9. Contact</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)" }}>
              For questions about these terms, contact us at <a href="mailto:edubazarshop@gmail.com" style={{ color: "var(--primary)" }}>edubazarshop@gmail.com</a> or WhatsApp at <a href="https://wa.me/919759131256" style={{ color: "var(--primary)" }}>9759131256</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
