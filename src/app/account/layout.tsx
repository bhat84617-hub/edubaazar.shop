import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account — Dashboard | EduBazar.shop",
  description: "Your EduBazar.shop dashboard. View orders, download courses, track payment verification and lifetime access.",
  robots: { index: false, follow: false, noarchive: true },
  alternates: { canonical: "https://www.edubaazar.shop/account" },
};
export default function AccountLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
