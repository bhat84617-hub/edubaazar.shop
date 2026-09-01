import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create Account — EduBazar.shop",
  description: "Create your EduBazar.shop account. Join 1000+ students learning Hacking, Programming, Trading from ₹49.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.edubaazar.shop/register" },
};
export default function RegisterLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
