import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zzkjeimlnawgrkuwbban.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2plaW1sbmF3Z3JrdXdiYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4OTM5MDgsImV4cCI6MjEwMzQ2OTkwOH0.JCfX_z6d--Tq5kXZ4Xc-nNm6LusJzgfhnLqlQ26sVMI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ADMIN_EMAIL = "admin@edubazar.shop";

export const STORE = {
  name: "EduBazar.shop",
  phone: "+91 9759131256",
  phoneRaw: "9759131256",
  whatsapp: "919759131256",
  email: "edubazarshop@gmail.com",
  upiId: "paytm.s34cntn@pty",
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
