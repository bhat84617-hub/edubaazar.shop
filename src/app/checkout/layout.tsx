import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Checkout — Secure UPI Payment | EduBazar.shop",
  description: "Secure UPI checkout at EduBazar.shop. Pay via Google Pay, PhonePe, Paytm. Instant verification and lifetime course access.",
  robots: { index: false, follow: false, noarchive: true },
  alternates: { canonical: "https://www.edubaazar.shop/checkout" },
};
export default function CheckoutLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
