import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | EduBazar Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
