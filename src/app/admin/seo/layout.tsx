import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Control Center",
  description: "Private technical SEO audit dashboard for EduBazar.shop.",
  robots: { index: false, follow: false },
};

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
