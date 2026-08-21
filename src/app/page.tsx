import Link from "next/link";
import { GraduationCap, Zap, Headset, ShieldCheck, Star, ArrowRight, Camera } from "lucide-react";
import Hero from "@/components/Hero";
import BestDealSlider from "@/components/BestDealSlider";
import CourseSearchSlider from "@/components/CourseSearchSlider";
import ProductCard from "@/components/ProductCard";
import CountUp from "@/components/CountUp";
import NewsletterPopup from "@/components/NewsletterPopup";
import NewsletterBox from "@/components/NewsletterBox";
import { products, CATEGORIES } from "@/lib/products";

const FEATURES = [
  { icon: <GraduationCap size={24} strokeWidth={1.5} />, title: "Expert Courses", desc: "Learn from industry professionals with real-world experience" },
  { icon: <Zap size={24} strokeWidth={1.5} />, title: "Instant Download", desc: "Get immediate access to your courses after payment" },
  { icon: <Headset size={24} strokeWidth={1.5} />, title: "24/7 Support", desc: "Round-the-clock assistance for all your queries" },
  { icon: <ShieldCheck size={24} strokeWidth={1.5} />, title: "Secure Payment", desc: "100% secure UPI payments with instant verification" },
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

      <BestDealSlider />

      {/* Trust bar */}
      <section className="ws-section ws-section-sm">
        <div className="container">
          <div className="ws-trust-row">
            <div className="ws-trust-chip"><ShieldCheck size={18} strokeWidth={1.5} /> Lifetime Access</div>
            <div className="ws-trust-chip"><GraduationCap size={18} strokeWidth={1.5} /> Expert Instructors</div>
            <div className="ws-trust-chip"><Zap size={18} strokeWidth={1.5} /> Instant Delivery</div>
            <div className="ws-trust-chip"><Headset size={18} strokeWidth={1.5} /> 24/7 Support</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="ws-section">
        <div className="container">
          <div className="ws-section-head">
            <span className="ws-section-tag">Browse</span>
            <h2>Shop by Category</h2>
            <div className="ws-divider" />
          </div>
          <div className="ws-cat-grid">
            {CATEGORIES.map((c) => {
              const count = products.filter((p) => p.category === c.key).length;
              return (
                <Link key={c.key} href={`/shop?cat=${encodeURIComponent(c.key)}`} className="ws-cat-card">
                  <img src={c.image} alt={c.label} loading="lazy" />
                  <div className="ws-cat-overlay" />
                  <div className="ws-cat-body">
                    <h3>{c.label}</h3>
                    <span>{count} products</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search + Course Slider */}
      <CourseSearchSlider />

      {/* Featured products */}
      <section className="ws-section">
        <div className="container">
          <div className="ws-section-head">
            <span className="ws-section-tag">Featured</span>
            <h2>Featured Courses</h2>
            <div className="ws-divider" />
          </div>
          <div className="ws-product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link href="/shop" className="ws-btn ws-btn-outline">
              View All Products <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="ws-section ws-section-sm">
        <div className="container">
          <div className="ws-promo-banner">
            <div>
              <h2>Limited Time Offer — 50% Off</h2>
              <p>Use code <strong>EDU50</strong> at checkout. Hurry, offer ends soon!</p>
            </div>
            <Link href="/shop" className="ws-btn ws-btn-fill">Grab the Deal <ArrowRight size={15} strokeWidth={1.5} /></Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="ws-section">
        <div className="container">
          <div className="ws-section-head">
            <span className="ws-section-tag">Why Choose Us</span>
            <h2>Everything You Need to Succeed</h2>
            <div className="ws-divider" />
          </div>
          <div className="ws-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="ws-feature-box">
                <div className="ws-feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="ws-section ws-section-sm">
        <div className="container">
          <div className="ws-stats-strip">
            {STATS.map((s) => (
              <div key={s.label} className="ws-stat-item">
                <div className="ws-stat-num">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="ws-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="ws-section">
        <div className="container">
          <div className="ws-section-head">
            <span className="ws-section-tag">New & Trending</span>
            <h2>Fresh Additions</h2>
            <div className="ws-divider" />
          </div>
          <div className="ws-product-grid">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="ws-section ws-section-sm">
        <div className="container">
          <div className="ws-section-head">
            <span className="ws-section-tag">Hot</span>
            <h2>Bestsellers</h2>
            <div className="ws-divider" />
          </div>
          <div className="ws-product-grid">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Free tools */}
      {freeStuff.length > 0 && (
        <section className="ws-section">
          <div className="container">
            <div className="ws-section-head">
              <span className="ws-section-tag">Free</span>
              <h2>Free Software & Tools</h2>
              <div className="ws-divider" />
            </div>
            <div className="ws-product-grid">
              {freeStuff.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="ws-section">
        <div className="container">
          <div className="ws-section-head">
            <span className="ws-section-tag">Testimonials</span>
            <h2>What Our Students Say</h2>
            <div className="ws-divider" />
          </div>
          <div className="ws-testimonial-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="ws-testimonial-card">
                <div className="ws-testimonial-stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p>&ldquo;{t.text}&rdquo;</p>
                <div className="ws-testimonial-person">
                  <div className="ws-testimonial-avatar">{t.name[0]}</div>
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
      <section className="ws-section ws-section-sm">
        <div className="container">
          <div className="ws-section-head">
            <span className="ws-section-tag">Instagram</span>
            <h2>Follow @edubazarshop</h2>
            <div className="ws-divider" />
          </div>
          <div className="ws-ig-strip">
            {IG.map((src, i) => (
              <a key={i} href="https://instagram.com" target="_blank" rel="noreferrer" className="ws-ig-item">
                <img src={src} alt="EduBazar Instagram" loading="lazy" />
                <div className="ws-ig-icon"><Camera size={24} strokeWidth={1.5} /></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="ws-section">
        <div className="container">
          <div className="ws-newsletter-box">
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
