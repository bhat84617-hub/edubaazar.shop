import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAdminSession } from "@/lib/admin-session";

export const metadata = {
  title: "SEO Control Center",
  description: "Private technical SEO audit dashboard for EduBazar.shop.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("edubazar_admin_session")?.value;

  if (!isValidAdminSession(session)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}