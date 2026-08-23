import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — EduBazar.shop",
  description: "How EduBazar.shop collects, uses, and protects your personal information. Your privacy is important to us.",
  keywords: ["EduBazar privacy", "data protection", "online course privacy", "UPI payment privacy", "student data policy"],
  openGraph: {
    title: "Privacy Policy — EduBazar.shop",
    description: "How EduBazar.shop collects, uses, and protects your personal information.",
    url: "https://www.edubaazar.shop/privacy",
  },
  alternates: { canonical: "https://www.edubaazar.shop/privacy" },
};

export default function PrivacyPage() {
  return (
    <div>
      <div style={{ background: "var(--primary-dark)", color: "#fff", padding: "38px 0 30px" }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            <Link href="/">Home</Link> <ChevronRight size={13} /> <span style={{ color: "var(--accent)" }}>Privacy Policy</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,40px)" }}>Privacy Policy</h1>
        </div>
      </div>
      <section className="section-pad">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="dash-panel" style={{ padding: 40 }}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Last updated: August 2026</p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>1. Information We Collect</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              When you use EduBazar.shop, we may collect: your name, email address, phone number (for order verification), payment transaction IDs (UTR), and browsing data (via cookies). We do not collect credit card numbers or banking passwords.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>2. How We Use Your Information</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              We use your information to: process orders and grant course access, send order confirmations and updates via email, verify payments, provide customer support, and improve our website experience. We do not sell your personal data to third parties.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>3. Data Storage</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              Your data is stored securely on Supabase (a secure cloud database) and Vercel (our hosting platform). Payment transaction IDs are stored for verification purposes only. We retain your order data for as long as your account exists.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>4. Cookies</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              We use essential cookies to remember your login, cart, and preferences. We do not use third-party advertising cookies. You can disable cookies in your browser settings, but some features may not work properly.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>5. Email Communications</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              We send emails only for: order confirmations, payment status updates, and account-related notifications. We do not send spam. If you signed up for our newsletter, you can unsubscribe at any time.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>6. Third-Party Services</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              We use Resend for sending transactional emails and Supabase for data storage. These services have their own privacy policies. We do not share your data with any other third parties.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>7. Your Rights</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              You can request to view, update, or delete your personal data by contacting us at edubazarshop@gmail.com. We will respond to your request within 7 business days.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>8. Children&apos;s Privacy</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              EduBazar.shop is not intended for users under 13 years of age. We do not knowingly collect personal information from children.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>9. Changes to This Policy</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated date.
            </p>

            <h2 style={{ fontSize: 20, marginBottom: 12 }}>10. Contact</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)" }}>
              For privacy-related questions, contact us at <a href="mailto:edubazarshop@gmail.com" style={{ color: "var(--primary)" }}>edubazarshop@gmail.com</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
