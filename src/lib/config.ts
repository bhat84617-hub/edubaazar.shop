import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[config] Supabase env vars missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

export const ADMIN_EMAIL = "admin@edubazar.shop";

export const STORE = {
  name: "EduBazar.shop",
  phone: "+91 9759131256",
  phoneRaw: "9759131256",
  whatsapp: "919759131256",
  email: "edubazarshop@gmail.com",
  upiId: "edubazar@upi",
  address: "India",
  instagram: "https://instagram.com",
};

export function upiLink(amount: number, note = "EduBazar Order"): string {
  const pa = STORE.upiId;
  const pn = "EduBazar";
  const am = amount > 0 ? `&am=${amount}` : "";
  const tn = encodeURIComponent(note);
  return `upi://pay?pa=${pa}&pn=${pn}&cu=INR${am}&tn=${tn}`;
}