import Link from "next/link";
import { GraduationCap, Zap, Headset, ShieldCheck, Star, ArrowRight, Camera } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CountUp from "@/components/CountUp";
import NewsletterPopup from "@/components/NewsletterPopup";
import NewsletterBox from "@/components/NewsletterBox";
import { products, CATEGORIES } from "@/lib/products";

const FEATURES = [
  { icon: <GraduationCap size={24} />, title: "Expert Courses", desc: "Learn from industry professionals with real-world experience" },
  { icon: <Zap size={24} />, title: "Instant Download", desc: "Get immediate access to your courses after payment" },
  { icon: <Headset size={24} />, title: "24/7 Support", desc: "Round-the-clock assistance for all your queries" },
  { icon: <ShieldCheck size={24} />, title: "Secure Payment", desc: "100% secure UPI payments with instant verification" },
];

const STATS = [
  { value: 15000, suffix: "+", label: "Happy Students" },
  { value: 5000, suffix: "+", label: "Courses Delivered" },
  { value: 25000, suffix: "+", label: "Downloads" },
  { value: 48, suffix: "", label: "Expert Courses" },
];

const TESTIMONIALS = [
  { name: "Rahul Sharma", role: "Cyber Security Student", text: "The ethical hacking course is the best I've found in India. Practical labs and real-world projects made me job-ready." },
  { name: "Priya Verma", role: "Python Developer", text: "I learned Python from absolute zero and now I'm working as a developer. EduBazar courses are worth every rupee!" },
  { name: "Aman Gupta", role: "Trader", text: "Trading psychology book completely changed my approach. The stock market course is practical and easy to follow." },
];

const IG = [
  "/images/ethical-hacking-pentest.jpeg",
  "/images/python-complete.jpeg",
  "/images/uiux-design.jpeg",
  "/images/hacking-bible.jpeg",
  "/images/javascript-mastery.jpeg",
  "/images/mindfluential-trading.jpeg",
];

const featured = products.filter((p) => p.featured && p.kind !== "tool").slice(0, 8);
const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((p) => p.kind !== "tool").slice(0, 8);
const bestSellers = products.filter((p) => p.badge === "Bestseller").slice(0, 4);
const freeStuff = products.filter((p) => p.price <= 0 && p.kind === "tool").slice(0, 4);

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Trust bar */}
      <section className="section-pad-sm" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="trust-row">
            <div className="trust-chip"><ShieldCheck size={20} /> Lifetime Access</div>
            <div className="trust-chip"><GraduationCap size={20} /> Expert Instructors</div>
            <div className="trust-chip"><Zap size={20} /> Instant Delivery</div>
            <div className="trust-chip"><Headset size={20} /> 24/7 Support</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-pad">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Browse</span>
            <h2>Shop by Category</h2>
            <p>Find courses, books and tools from our curated catalog</p>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => {
              const count = products.filter((p) => p.category === c.key).length;
              return (
                <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} className="cat-card">
                  <img src={c.image} alt={c.label} loading="lazy" />
                  <div className="cat-overlay" />
                  <div className="cat-body">
                    <h3>{c.label}</h3>
                    <span>{count} products</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section-pad" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Featured</span>
            <h2>Featured Courses</h2>
            <p>Our most popular products chosen by students</p>
          </div>
          <div className="p-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/shop" className="btn btn-primary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="section-pad-sm">
        <div className="container">
          <div className="promo-banner">
            <div>
              <h2>Limited Time Offer — 50% Off</h2>
              <p>
                Use code <strong>EDU50</strong> at checkout. Hurry, offer ends soon!
              </p>
            </div>
            <Link href="/shop" className="btn btn-accent">
              Grab the Deal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-pad">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Why Choose Us</span>
            <h2>Everything You Need to Succeed</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-box">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-pad-sm">
        <div className="container">
          <div className="stats-strip">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <div className="num">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="section-pad">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">New & Trending</span>
            <h2>Fresh Additions</h2>
            <p>Just added to our catalog — grab them before they sell out</p>
          </div>
          <div className="p-grid">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section-pad-sm">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Hot</span>
            <h2>Bestsellers</h2>
          </div>
          <div className="p-grid">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Free tools */}
      {freeStuff.length > 0 && (
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <span className="section-tag">Free</span>
              <h2>Free Software & Tools</h2>
              <p>Download and explore — no payment needed</p>
            </div>
            <div className="p-grid">
              {freeStuff.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="section-pad" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Testimonials</span>
            <h2>What Our Students Say</h2>
          </div>
          <div className="t-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="t-card">
                <div className="t-stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={15} fill="currentColor" />
                  ))}
                </div>
                <p>“{t.text}”</p>
                <div className="t-person">
                  <div className="t-avatar">{t.name[0]}</div>
                  <div>
                    <h5>{t.name}</h5>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram strip */}
      <section className="section-pad-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Instagram</span>
            <h2>Follow @edubazarshop</h2>
          </div>
          <div className="ig-strip">
            {IG.map((src, i) => (
              <a key={i} href="https://instagram.com" target="_blank" rel="noreferrer" className="ig-item">
                <img src={src} alt="EduBazar Instagram" loading="lazy" />
                <div className="ig-icon"><Camera size={26} /></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-pad">
        <div className="container">
          <div className="newsletter-box">
            <h2>Subscribe to Our Newsletter</h2>
            <p>Get the latest courses, deals & updates straight to your inbox.</p>
            <NewsletterBox />
          </div>
        </div>
      </section>

      <NewsletterPopup />
    </>
  );
}