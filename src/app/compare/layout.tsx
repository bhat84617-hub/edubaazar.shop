import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Compare Courses — EduBazar.shop",
  description: "Compare courses side-by-side at EduBazar.shop. Find the best Hacking, Programming, Trading course for you.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.edubaazar.shop/compare" },
};
export default function CompareLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
