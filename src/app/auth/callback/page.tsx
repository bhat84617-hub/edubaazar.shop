"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/config";
import { useStore } from "@/lib/store";

// Handles the return trip from Google OAuth (Supabase PKCE flow).
// 1. Exchanges ?code= for a Supabase session
// 2. Sends the access_token to /api/auth/google, which verifies it server-side
//    and creates/fetches the app user
// 3. Logs the user into the app store and redirects to /account
export default function AuthCallbackPage() {
  const router = useRouter();
  const { login, showToast } = useStore();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get("error");
        if (oauthError) {
          throw new Error(params.get("error_description")?.replace(/\+/g, " ") || "Google login cancel ho gaya.");
        }
        const code = params.get("code");
        if (code) {
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) throw new Error("Google session verify nahi ho payi. Dobara try karein.");
        }
        const { data: { session }, error: sessErr } = await supabase.auth.getSession();
        if (sessErr || !session?.access_token) {
          throw new Error("Google session nahi mili. Dobara try karein.");
        }
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: session.access_token }),
        });
        const data = (await res.json().catch(() => null)) as { user?: { name: string; email: string }; error?: string } | null;
        if (!res.ok || !data?.user) {
          throw new Error(data?.error || "Login failed. Dobara try karein.");
        }
        login({ name: data.user.name, email: data.user.email });
        showToast(`Welcome, ${data.user.name}!`);
        // App uses its own session (localStorage) — clear the Supabase one
        await supabase.auth.signOut().catch(() => {});
        router.replace("/account");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kuch galat ho gaya. Dobara try karein.");
      }
    };
    run();
  }, [router, login, showToast]);

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: "center", padding: "60px 30px" }}>
        {error ? (
          <>
            <AlertTriangle size={44} style={{ color: "#FF515C", marginBottom: 14 }} />
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Login nahi ho paya</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 22 }}>{error}</p>
            <Link href="/login" className="btn btn-primary">Wapas Login pe jayein</Link>
          </>
        ) : (
          <>
            <Loader2 size={44} style={{ color: "var(--primary)", marginBottom: 14, animation: "spin 1s linear infinite" }} />
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Google se login ho raha hai…</h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Kripya wait karein, aapko redirect kiya ja raha hai.</p>
          </>
        )}
      </div>
    </div>
  );
}
