import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://trscqdizztkfupntqplo.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyc2NxZGl6enRrZnVwbnRxcGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTk4NDEsImV4cCI6MjEwMjM3NTg0MX0.CykzlDqkkH2uwJ2vkZFwCi6bG8H3E3qplVMwKQUA6JA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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