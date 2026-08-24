"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Lock, ArrowLeft, Info } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    let success = false;
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (response.ok) {
        success = true;
        localStorage.setItem("edubazar_admin", "true");
        window.location.href = "/admin";
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
    if (!success) setError(true);
    setPassword("");
  };

  return (
    <div className="auth-wrap" style={{ background: "radial-gradient(1200px 500px at 70% -10%, rgba(251,188,52,0.12), transparent), var(--cream)" }}>
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ width: 74, height: 74, borderRadius: 999, background: "var(--primary)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={34} />
          </div>
          <h1>Admin Access</h1>
          <p>Enter admin credentials to access the dashboard</p>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label><Lock size={13} style={{ verticalAlign: "-2px" }} /> Admin Password</label>
            <input type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="auth-alert error show">Invalid password! Access denied.</div>}
          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            <ShieldCheck size={16} /> {busy ? "Checking..." : "Access Dashboard"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Info size={13} /> Admin access is configured on the server.
        </p>
        <p style={{ textAlign: "center", marginTop: 10 }}>
          <Link href="/" style={{ fontSize: 12.5, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ArrowLeft size={13} /> Back to Store
          </Link>
        </p>
      </div>
    </div>
  );
}