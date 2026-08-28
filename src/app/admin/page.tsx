import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";
import AdminDashboard from "./dashboard";

export const dynamic = "force-dynamic";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("edubazar_admin_session")?.value;

  if (!isValidAdminSession(session)) {
    redirect("/admin/login");
  }

  const db = getDb();
  let orders: Record<string, unknown>[] = [];
  if (db) {
    const { data } = await db.from("orders").select("*").order("date", { ascending: false });
    orders = (data as Record<string, unknown>[]) || [];
  }

  return <AdminDashboard initialOrders={orders} />;
}