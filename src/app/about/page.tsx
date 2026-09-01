import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Zap, Headset, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — India's Affordable Learning Platform",
  description: "Learn about EduBazar.shop — India's affordable online learning platform. 30+ premium courses in Ethical Hacking, Programming, Python, Trading & more from ₹49. Lifetime access.",
  keywords: ["about EduBazar", "online learning platform India", "affordable courses", "EduBazar shop about", "ethical hacking courses India", "programming courses cheap"],
  alternates: { canonical: "https://www.edubaazar.shop/about" },
  openGraph: {
    title: "About EduBazar.shop — India's Affordable Learning Platform",
    description: "30+ premium courses in Hacking, Programming, Trading & more from ₹49. Lifetime access, UPI payment.",
    url: "https://www.edubaazar.shop/about",
    type: "website",
    images: [{ url: "https://www.edubaazar.shop/logo/edulogo.jpeg", width: 512, height: 512, alt: "About EduBazar.shop" }],
  },
  twitter: { card: "summary_large_image", title: "About EduBazar.shop", description: "India's affordable learning platform for Hacking, Programming, Trading & more." },
};

const values = [
  { icon: <GraduationCap size={20} />, title: "Quality Education", desc: "Every course is created by industry experts with real-world experience. No fluff — only practical, actionable content." },
  { icon: <Zap size={20} />, title: "Instant Access", desc: "No waiting. Pay via UPI, get verified within hours, and start learning immediately. Lifetime access to everything." },
  { icon: <ShieldCheck size={20} />, title: "Affordable Pricing", desc: "Premium courses starting at just ₹49. We believe quality education shouldn't burn a hole in your pocket." },
  { icon: <Headset size={20} />, title: "Student Support", desc: "WhatsApp support at 9759131256. We're always here to help with any issues or questions." },
];

export default function AboutPage() {
  const SITE = "https://www.edubaazar.shop";
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": SITE + "/about#aboutpage",
    name: "About EduBazar.shop",
    description: "India's affordable online learning platform with 30+ courses in Hacking, Programming, Trading & more from ₹49.",
    url: SITE + "/about",
    isPartOf: { "@id": SITE + "/#website" },
    about: { "@id": SITE + "/#organization" },
    mainEntity: { "@id": SITE + "/#organization" },
    breadcrumb: { "@id": SITE + "/about#breadcrumb" },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "About Us", item: SITE + "/about" },
    ],
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div style={{ background: "#f8f9fb", borderBottom: "1px solid #E5E5E5", padding: "28px 0 20px" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb" style={{ marginBottom: 10 }}>
            <Link href="/">Home</Link> <ChevronRight size={12} aria-hidden="true" /> <span style={{ color: "#2A74ED", fontWeight: 700 }} aria-current="page">About Us</span>
          </nav>
          <h1 style={{ color: "#242424", fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, letterSpacing: "-0.4px" }}>About <span style={{ color: "#2A74ED" }}>EduBazar.shop</span></h1>
        </div>
      </div>

      <section className="section-pad">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="dash-panel" style={{ padding: 28, borderRadius: 20 }}>
            <h2 style={{ marginBottom: 14, fontSize: 18, fontWeight: 800, color: "#242424" }}>Our Mission</h2>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#777", marginBottom: 14 }}>
              EduBazar.shop was founded with one simple mission: <strong style={{ color: "#242424" }}>make quality education accessible to every student in India</strong>. We noticed that premium courses on platforms like Udemy and Coursera cost ₹3,000-₹10,000, putting them out of reach for many students. We decided to change that.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#777", marginBottom: 14 }}>
              Today, EduBazar offers <strong style={{ color: "#242424" }}>30+ premium courses</strong> in Ethical Hacking, Programming, Python, JavaScript, Stock Market Trading, Digital Marketing, UI/UX Design, and more — starting at just <strong style={{ color: "#242424" }}>₹49</strong>. Every course comes with lifetime access, downloadable resources, and a certificate of completion.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#777", marginBottom: 24 }}>
              We use <strong style={{ color: "#242424" }}>UPI payments</strong> (Google Pay, PhonePe, Paytm) so that anyone can pay easily. Once you complete the payment and share your transaction ID, our team verifies it and grants you instant access.
            </p>

            <h2 style={{ marginBottom: 14, fontSize: 16, fontWeight: 800, color: "#242424" }}>Why Students Choose EduBazar</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
              {values.map((v, i) => (
                <div key={i} style={{ padding: 16, background: "#f8f9fb", border: "1px solid #E5E5E5", borderRadius: 16, textAlign: "center" }}>
                  <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef3ff", color: "#2A74ED", borderRadius: "50%", margin: "0 auto 10px", border: "1px solid #d6e3ff" }}>{v.icon}</div>
                  <h4 style={{ marginBottom: 6, fontSize: 12, fontWeight: 800, color: "#242424", textTransform: "uppercase", letterSpacing: 0.4 }}>{v.title}</h4>
                  <p style={{ fontSize: 12, color: "#777", lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 28, marginBottom: 12, fontSize: 16, fontWeight: 800, color: "#242424" }}>Our Numbers</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 10 }}>
              {[
                { n: "30+", l: "Courses" },
                { n: "7", l: "Categories" },
                { n: "₹49", l: "Starting Price" },
                { n: "24/7", l: "Support" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: 16, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#2A74ED" }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: "#777", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 28, marginBottom: 12, fontSize: 16, fontWeight: 800, color: "#242424" }}>Contact Us</h2>
            <div style={{ background: "#f8f9fb", border: "1px solid #E5E5E5", borderRadius: 16, padding: 16 }}>
              <ul style={{ fontSize: 13, lineHeight: 2, color: "#777", listStyle: "none" }}>
                <li><strong style={{ color: "#242424" }}>WhatsApp:</strong> <a href="https://wa.me/919759131256" style={{ color: "#2A74ED", fontWeight: 700 }}>9759131256</a></li>
                <li><strong style={{ color: "#242424" }}>Email:</strong> <a href="mailto:edubazarshop@gmail.com" style={{ color: "#2A74ED" }}>edubazarshop@gmail.com</a></li>
                <li><strong style={{ color: "#242424" }}>Instagram:</strong> <a href="https://instagram.com/edubazarshop" target="_blank" rel="noreferrer" style={{ color: "#2A74ED" }}>@edubazarshop</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
