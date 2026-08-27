"use client";

import { useEffect, useState } from "react";
import { X, TicketPercent } from "lucide-react";
import { useStore } from "@/lib/store";

export default function NewsletterPopup() {
  const { showToast } = useStore();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem("edubazar_news_pop") === "1") return;
      const t = setTimeout(() => setOpen(true), 12000);
      return () => clearTimeout(t);
    } catch {
      return;
    }
  }, []);

  const dismiss = (saved: boolean) => {
    try {
      localStorage.setItem("edubazar_news_pop", "1");
    } catch {
      // ignore
    }
    setOpen(false);
    if (saved) showToast("You have unlocked 10% extra off!");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    dismiss(true);
  };

  return (
    <div className={`news-pop ${open ? "open" : ""}`}>
      <button className="news-pop-x" onClick={() => dismiss(false)} aria-label="Close">
        <X size={18} />
      </button>
      <div className="news-pop-card">
        <div className="news-pop-img">
          <TicketPercent size={72} />
        </div>
        <div className="news-pop-body">
          <h3>Get 10% Extra Off!</h3>
          <p>
            Subscribe to our newsletter and unlock exclusive deals on courses,
            books &amp; tools. No spam, ever.
          </p>
          <form onSubmit={submit}>
            <div className="field">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Claim My Discount
            </button>
          </form>
          <p style={{ fontSize: 11, textAlign: "center", marginTop: 12, marginBottom: 0 }}>
            Use code <strong>EDU50</strong> at checkout
          </p>
        </div>
      </div>
    </div>
  );
}