"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/config";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { login, showToast } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: existing } = await supabase.from("users").select("id").eq("email", email.trim().toLowerCase()).single();
      if (existing) {
        setError("This email is already registered. Please login.");
        setLoading(false);
        return;
      }
      const { error: insErr } = await supabase
        .from("users")
        .insert([{ name: name.trim(), email: email.trim().toLowerCase(), password }]);
      if (insErr) throw new Error(insErr.message);
      login({ name: name.trim(), email: email.trim().toLowerCase() });
      showToast("Account created! Welcome to EduBazar.");
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "signup", name: name.trim(), email: email.trim().toLowerCase() }),
      }).catch(() => {});
      router.push("/account");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError("Signup failed: " + msg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo/edulogo.jpeg" alt="EduBazar" />
          <h1>Create Account</h1>
          <p>Create your account to access courses</p>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label><User size={13} style={{ verticalAlign: "-2px" }} /> Full Name</label>
            <input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label><Mail size={13} style={{ verticalAlign: "-2px" }} /> Email Address</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label><Lock size={13} style={{ verticalAlign: "-2px" }} /> Password</label>
            <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={4} required />
          </div>
          {error && <div className="auth-alert error show">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            <UserPlus size={16} /> {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: "var(--muted)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Login</Link>
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