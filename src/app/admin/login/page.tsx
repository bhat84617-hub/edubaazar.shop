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
        window.location.replace("/admin");
        return;
      }
      if (r.status === 503) setError("ADMIN_PASSWORD Vercel pe set nahi hai.");
      else if (r.status === 401) setError("Galat password!");
      else setError(data?.error || "Server error");
    } catch {
      setError("Network error");
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#edece9", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", border: "1px solid #d5d7da", padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 16px", background: "#181d27", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={30} color="#edece9" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#181d27", margin: 0 }}>Admin Login</h1>
        </div>
        <form onSubmit={submit}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#181d27", marginBottom: 6 }}>
            <Lock size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} />Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            required
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #d5d7da", background: "#fff", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
          />
          {error && (
            <div style={{ padding: "10px 14px", background: "#fdecea", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            style={{ width: "100%", padding: "13px 0", background: "#181d27", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: busy ? "wait" : "pointer", letterSpacing: 0.5 }}
          >
            {busy ? "Checking..." : "Login"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>
            <ArrowLeft size={12} style={{ verticalAlign: "-1px" }} /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
