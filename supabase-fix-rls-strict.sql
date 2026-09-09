-- STRICT FIX for "Table public.users is exposed via API without RLS and contains password"
-- This removes anon SELECT entirely so password can NEVER be leaked via API
-- App will use service_role via API routes for login/register

-- 1. Ensure RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL old policies on users (including permissive anon select)
DROP POLICY IF EXISTS "Allow anon insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users for login" ON public.users;
DROP POLICY IF EXISTS "Allow service_role all users" ON public.users;

-- 3. Create STRICT policies for users
-- Only anon can INSERT (for signup) - no SELECT
CREATE POLICY "users_anon_insert"
ON public.users FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- NO anon SELECT - this is the critical fix: anon cannot SELECT users at all, so password never leaks via API
-- Only service_role can SELECT/UPDATE/DELETE (used by server API routes)
CREATE POLICY "users_service_all"
ON public.users FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Optional: if you need authenticated users to see their own row (without password), use a VIEW:
CREATE OR REPLACE VIEW public.users_safe AS
SELECT id, name, email, created_at FROM public.users;
GRANT SELECT ON public.users_safe TO anon, authenticated;

-- 4. Orders: keep anon insert/select for checkout (no sensitive password column)
DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon select own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service_role all orders" ON public.orders;
DROP POLICY IF EXISTS "orders_anon_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_anon_select" ON public.orders;
DROP POLICY IF EXISTS "orders_service_all" ON public.orders;

CREATE POLICY "orders_anon_insert"
ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "orders_anon_select"
ON public.orders FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "orders_service_all"
ON public.orders FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- 5. Revoke direct anon access to users table as extra safety (Supabase already respects RLS, but this is defense in depth)
-- Do NOT run REVOKE if you rely on anon INSERT - the policy above already controls INSERT, REVOKE would break it
-- So we keep GRANT but RLS with no anon SELECT ensures no leak

-- Verify:
-- SELECT * FROM pg_policies WHERE tablename IN ('users','orders');
-- SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('users','orders');
-- Try as anon: SELECT * FROM users; should return 0 rows (RLS blocks) - test with anon key in SQL editor (switch role to anon)
