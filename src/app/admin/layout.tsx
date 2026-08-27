import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAdminSession } from "@/lib/admin-session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | EduBazar Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const nextUrl = hdrs.get("next-url") || "";
  const isLoginPage = nextUrl === "/admin/login";

  if (!isLoginPage) {
    const cookieStore = await cookies();
    const session = cookieStore.get("edubazar_admin_session")?.value;
    if (!isValidAdminSession(session)) {
      redirect("/admin/login");
    }
  }

  return <>{children}</>;
}
