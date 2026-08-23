import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Zap, Headset, GraduationCap, Users, BookOpen, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about EduBazar.shop — India's affordable online learning platform. We provide premium courses in Ethical Hacking, Programming, Trading & more at prices everyone can afford.",
  keywords: ["about EduBazar", "online learning platform India", "affordable courses", "EduBazar shop about"],
  alternates: { canonical: "https://www.edubaazar.shop/about" },
  openGraph: { title: "About EduBazar.shop", description: "India's affordable online learning platform for Hacking, Programming, Trading & more." },
};

const values = [
  { icon: <GraduationCap size={24} />, title: "Quality Education", desc: "Every course is created by industry experts with real-world experience. No fluff — only practical, actionable content." },
  { icon: <Zap size={24} />, title: "Instant Access", desc: "No waiting. Pay via UPI, get verified within hours, and start learning immediately. Lifetime access to everything." },
  { icon: <ShieldCheck size={24} />, title: "Affordable Pricing", desc: "Premium courses starting at just ₹49. We believe quality education shouldn't burn a hole in your pocket." },
  { icon: <Headset size={24} />, title: "Student Support", desc: "WhatsApp support at 9759131256. We're always here to help with any issues or questions." },
];

export default function AboutPage() {
  return (
    <div>
      <div style={{ background: "var(--primary-dark)", color: "#fff", padding: "38px 0 30px" }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            <Link href="/">Home</Link> <ChevronRight size={13} /> <span style={{ color: "var(--accent)" }}>About Us</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,40px)" }}>About EduBazar.shop</h1>
        </div>
      </div>

      <section className="section-pad">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="dash-panel" style={{ padding: 40 }}>
            <h2 style={{ marginBottom: 16 }}>Our Mission</h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              EduBazar.shop was founded with one simple mission: <strong>make quality education accessible to every student in India</strong>. We noticed that premium courses on platforms like Udemy and Coursera cost ₹3,000-₹10,000, putting them out of reach for many students. We decided to change that.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "var(--muted)", marginBottom: 20 }}>
              Today, EduBazar offers <strong>30+ premium courses</strong> in Ethical Hacking, Programming, Python, JavaScript, Stock Market Trading, Digital Marketing, UI/UX Design, and more — starting at just <strong>₹49</strong>. Every course comes with lifetime access, downloadable resources, and a certificate of completion.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "var(--muted)", marginBottom: 30 }}>
              We use <strong>UPI payments</strong> (Google Pay, PhonePe, Paytm) so that anyone can pay easily. Once you complete the payment and share your transaction ID, our team verifies it and grants you instant access. It's that simple.
            </p>

            <h2 style={{ marginBottom: 16 }}>Why Students Choose EduBazar</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 20 }}>
              {values.map((v, i) => (
                <div key={i} style={{ padding: 24, background: "var(--soft)", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ color: "var(--primary)", marginBottom: 12, display: "flex", justifyContent: "center" }}>{v.icon}</div>
                  <h4 style={{ marginBottom: 8 }}>{v.title}</h4>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 40, marginBottom: 16 }}>Our Numbers</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginTop: 16 }}>
              {[
                { n: "30+", l: "Courses" },
                { n: "7", l: "Categories" },
                { n: "₹49", l: "Starting Price" },
                { n: "24/7", l: "Support" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: 20, background: "var(--soft)", borderRadius: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 40, marginBottom: 16 }}>Contact Us</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--muted)" }}>
              Have questions? Reach out anytime:
            </p>
            <ul style={{ fontSize: 15, lineHeight: 2, color: "var(--muted)", marginTop: 10 }}>
              <li><strong>WhatsApp:</strong> <a href="https://wa.me/919759131256" style={{ color: "var(--primary)" }}>9759131256</a></li>
              <li><strong>Email:</strong> <a href="mailto:edubazarshop@gmail.com" style={{ color: "var(--primary)" }}>edubazarshop@gmail.com</a></li>
              <li><strong>Instagram:</strong> <a href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>@edubazarshop</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
