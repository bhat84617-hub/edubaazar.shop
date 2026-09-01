import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shopping Cart — EduBazar.shop",
  description: "Review your selected courses in your EduBazar.shop cart. Secure UPI checkout, instant digital delivery.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  alternates: { canonical: "https://www.edubaazar.shop/cart" },
};
export default function CartLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
