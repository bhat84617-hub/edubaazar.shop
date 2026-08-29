"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = await r.json().catch(() => null);
      if (r.ok) {
        window.location.href = "/admin";
        return;
      }
      setError(data?.error || "Login failed");
    } catch {
      setError("Network error");
    }
    setBusy(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0f1117", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,system-ui,sans-serif",
    }}>
      <style jsx global>{`
        .adm-login * { margin: 0; padding: 0; box-sizing: border-box; }
        .adm-login-card {
          width: 100%; max-width: 400px; background: linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
          border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 44px 36px;
          box-shadow: 0 20px 60px rgba(0,0,0,.4); backdrop-filter: blur(10px);
        }
        .adm-login-card input:focus { border-color: rgba(129,140,248,.5); }
      `}</style>

      <div className="adm-login">
        <div className="adm-login-card" style={{ textAlign: "center" }}>
          <div style={{
            width: 60, height: 60, margin: "0 auto 18px", background: "linear-gradient(135deg,#818cf8,#6366f1)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(99,102,241,.3)",
          }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0f1f5", letterSpacing: "-.3px" }}>
            EduBazar Admin
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
            Enter password to access dashboard
          </p>

          <form onSubmit={submit} style={{ marginTop: 30, textAlign: "left" }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.45)",
              marginBottom: 8, textTransform: "uppercase", letterSpacing: ".8px",
            }}>
              <Lock size={11} style={{ verticalAlign: "-1px", marginRight: 4 }} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              required
              style={{
                width: "100%", padding: "13px 16px",
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 10, color: "#e4e6eb", fontSize: 14, outline: "none",
                marginBottom: 18, boxSizing: "border-box", transition: "border .2s",
              }}
            />
            {error && (
              <div style={{
                padding: "11px 14px", background: "rgba(248,113,113,.1)",
                color: "#f87171", fontSize: 12.5, marginBottom: 16, borderRadius: 8,
                border: "1px solid rgba(248,113,113,.15)",
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              style={{
                width: "100%", padding: "13px 0",
                background: "linear-gradient(135deg,#818cf8,#6366f1)", color: "#fff",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: busy ? "wait" : "pointer", letterSpacing: ".3px", transition: "opacity .2s",
                boxShadow: "0 4px 16px rgba(99,102,241,.3)",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Verifying…" : "Login"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/" style={{
              fontSize: 12, color: "rgba(255,255,255,.25)", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <ArrowLeft size={12} /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
