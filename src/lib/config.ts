import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[config] Supabase env missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
);

export const ADMIN_EMAIL = "admin@edubazar.shop";

export const STORE = {
  name: "EduBazar.shop",
  phone: "+91 9582501582",
  phoneRaw: "9582501582",
  whatsapp: "919582501582",
  email: "edubazarshop@gmail.com",
  upiId: "paytm.s34cntn@pty",
  address: "India",
  instagram: "https://instagram.com",
};

// ---- Coupons (Diwali Dhamaka Sale) ----
// Coupon codes are validated BOTH client-side (for instant UI feedback) and
// server-side in POST /api/orders (the server is the source of truth — client
// values are never trusted for pricing).
export type Coupon = {
  code: string;
  percent: number; // 0-100
  expiresAt: string; // ISO timestamp
  label: string;
};

export const COUPONS: Record<string, Coupon> = {
  DIWALI50: {
    code: "DIWALI50",
    percent: 50,
    expiresAt: "2026-11-10T23:59:59+05:30",
    label: "Diwali Dhamaka Sale — flat 50% off",
  },
};

/** Returns the coupon if it exists and has not expired, else null. */
export function getValidCoupon(code: string): Coupon | null {
  if (!code) return null;
  const c = COUPONS[code.trim().toUpperCase()];
  if (!c) return null;
  if (Number.isNaN(new Date(c.expiresAt).getTime())) return null;
  if (Date.now() > new Date(c.expiresAt).getTime()) return null;
  return c;
}

/** Discount in INR (rounded) for a given subtotal. */
export function couponDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon || subtotal <= 0) return 0;
  return Math.round((subtotal * coupon.percent) / 100);
}

export function upiLink(amount: number, note = "EduBazar Order"): string {
  const pa = STORE.upiId;
  const pn = "EduBazar";
  const am = amount > 0 ? `&am=${amount}` : "";
  const tn = encodeURIComponent(note);
  return `upi://pay?pa=${pa}&pn=${pn}&cu=INR${am}&tn=${tn}`;
}
