"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function NewsletterBox() {
  const { showToast } = useStore();
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    showToast("🎉 Subscribed! Dhanyavaad.");
    setEmail("");
  };

  return (
    <form className="newsletter-form" onSubmit={subscribe}>
      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button className="btn btn-accent" type="submit">Subscribe</button>
    </form>
  );
}