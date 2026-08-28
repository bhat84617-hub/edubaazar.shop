"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AdminLoginPage() {
  const { adminLogin } = useStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const success = adminLogin(password);
      if (success) {
        window.location.href = "/admin";
        return;
      }
      setError("Galat password");
    } catch {
      setError("Network error");
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7f6", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "48px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 16px", background: "#1a1a2e", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={32} color="#edece9" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#181d27", margin: 0 }}>EduBazar Admin</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Enter password to access dashboard</p>
        </div>
        <form onSubmit={submit}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#181d27", marginBottom: 8 }}>
            <Lock size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} />Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
            style={{ width: "100%", padding: "14px 16px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 15, outline: "none", marginBottom: 20, boxSizing: "border-box", transition: "border 0.2s" }}
          />
          {error && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#dc2626", fontSize: 13, marginBottom: 16, borderRadius: 8, border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            style={{ width: "100%", padding: "14px 0", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: busy ? "wait" : "pointer", letterSpacing: 0.5, transition: "background 0.2s" }}
          >
            {busy ? "Verifying..." : "Login"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/" style={{ fontSize: 12, color: "#aaa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={12} /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
