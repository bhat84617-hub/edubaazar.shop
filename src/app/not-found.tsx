import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-pad">
      <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
        <h1 style={{ fontSize: 72, fontWeight: 700, color: "var(--line)", margin: "0 0 8px" }}>404</h1>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">Go to Homepage</Link>
          <Link href="/shop" className="btn btn-outline">Browse Courses</Link>
        </div>
      </div>
    </section>
  );
}
