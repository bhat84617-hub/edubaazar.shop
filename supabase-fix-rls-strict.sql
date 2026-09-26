-- STRICT RLS — end state (apply ONLY after deploying code that includes
-- POST /api/orders, scrypt auth routes and service_role-only writes).
--
-- After this, anon key can READ NOTHING and WRITE NOTHING:
--  - checkout      → POST /api/orders (service_role)
--  - order lookup  → GET  /api/orders?email= (service_role)
--  - login/register→ /api/auth/* (service_role)
--  - admin panel   → /api/admin/* (service_role)
--  - telegram bot  → webhook (service_role)
-- Deploy order: 1) deploy code + verify checkout works, 2) run this SQL, 3) test again.
-- Rollback: re-run supabase-fix-rls.sql (anon INSERT version).

-- 1. Ensure RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop every old policy (permissive + insert-only) on users
DROP POLICY IF EXISTS "Allow anon insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users for login" ON public.users;
DROP POLICY IF EXISTS "Allow service_role all users" ON public.users;
DROP POLICY IF EXISTS "users_anon_insert" ON public.users;
DROP POLICY IF EXISTS "users_service_all" ON public.users;
DROP POLICY IF EXISTS "Allow all on users" ON public.users;

-- 3. users: service_role ONLY (anon cannot insert, select, update or delete)
CREATE POLICY "users_service_all"
ON public.users FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Safe view for non-sensitive columns (used by nothing secret-bearing)
CREATE OR REPLACE VIEW public.users_safe AS
SELECT id, name, email, created_at FROM public.users;
GRANT SELECT ON public.users_safe TO anon, authenticated;

-- 4. Drop every old policy on orders (including anon INSERT — server API replaces it)
DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon select own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service_role all orders" ON public.orders;
DROP POLICY IF EXISTS "orders_anon_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_anon_select" ON public.orders;
DROP POLICY IF EXISTS "orders_service_all" ON public.orders;
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;

-- 5. orders: service_role ONLY
CREATE POLICY "orders_service_all"
ON public.orders FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Verify:
-- SELECT * FROM pg_policies WHERE tablename IN ('users','orders');
-- Expected: exactly 2 rows (users_service_all, orders_service_all), both TO service_role.
-- Anon test (set role to anon in SQL editor): INSERT INTO orders(...) must FAIL.
