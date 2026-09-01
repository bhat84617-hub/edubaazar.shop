import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Login — EduBazar.shop",
  description: "Login to EduBazar.shop to access your courses, orders and downloads. Secure account access.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.edubaazar.shop/login" },
};
export default function LoginLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
