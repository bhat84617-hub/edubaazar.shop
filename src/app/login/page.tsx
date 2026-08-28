"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, LogIn, ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, showToast, loginUser } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = loginUser(email.trim().toLowerCase(), password);
      if (!success) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      showToast(`Welcome back!`);
      router.push("/account");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo/edulogo.jpeg" alt="EduBazar" />
          <h1>Welcome Back</h1>
          <p>Login to access your courses & dashboard</p>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label><Mail size={13} style={{ verticalAlign: "-2px" }} /> Email Address</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label><Lock size={13} style={{ verticalAlign: "-2px" }} /> Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="auth-alert error show">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            <LogIn size={16} /> {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: "var(--muted)" }}>
          Don't have an account? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign Up</Link>
        </p>
        <p style={{ textAlign: "center", marginTop: 8 }}>
          <Link href="/" style={{ fontSize: 12.5, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ArrowLeft size={13} /> Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
