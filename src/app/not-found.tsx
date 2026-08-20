import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section-pad">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="dash-panel" style={{ textAlign: "center", padding: "70px 24px" }}>
          <Compass size={54} style={{ color: "var(--primary)", marginBottom: 16 }} />
          <h1 style={{ fontSize: 72, fontFamily: "var(--font-heading)", color: "var(--primary)" }}>404</h1>
          <h3 style={{ marginBottom: 8 }}>Page not found</h3>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    </section>
  );
}