-- Fix critical: Table public.users exposed via API without RLS (contains password column)
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Project: zzkjeimlnawgrkuwbban

-- 1. Enable RLS on users and orders (if not already)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop old permissive policies if exist (to avoid duplicates)
DROP POLICY IF EXISTS "Allow anon insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users for login" ON public.users;
DROP POLICY IF EXISTS "Allow service_role all users" ON public.users;
DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon select own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_anon_select" ON public.orders;
DROP POLICY IF EXISTS "users_anon_select" ON public.users;
DROP POLICY IF EXISTS "Allow service_role all orders" ON public.orders;

-- 3. Users policies
-- Allow anon to create account (INSERT)
CREATE POLICY "Allow anon insert users"
ON public.users FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- NO anon SELECT: passwords (even hashed) must never be readable with the public
-- anon key. Login/register go through API routes that use SUPABASE_SERVICE_ROLE_KEY.
-- (If an old "Allow anon select users" policy exists it is dropped above.)

-- Service role full access (used by server via SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "Allow service_role all users"
ON public.users FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- 4. Orders policies
CREATE POLICY "Allow anon insert orders"
ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- NO anon SELECT: order PII (name/email/UTR/download URLs) is only readable via
-- server API routes (/api/orders, admin, telegram) that use the service_role key.

CREATE POLICY "Allow service_role all orders"
ON public.orders FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- 5. OPTIONAL but RECOMMENDED: Hide password via VIEW (prevents password exposure even if RLS is permissive)
-- Create a safe view without password for client use
CREATE OR REPLACE VIEW public.users_safe AS
SELECT id, name, email, created_at FROM public.users;

-- Grant access to the view
GRANT SELECT ON public.users_safe TO anon, authenticated;

-- 6. OPTIONAL: Hash passwords instead of plain text (critical long-term fix)
-- If you keep plain passwords, at least restrict API: consider moving to Supabase Auth
-- For now, ensure app code never does SELECT * on users without filter - always filter by email+password

-- Verify fix:
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('users','orders');
-- Should show t (true) for both

-- After running, go to Supabase Dashboard -> Database -> Tables -> users -> check RLS Enabled = true
-- The critical warning "Table public.users is exposed via API without RLS" will disappear within 24h or on next scan
