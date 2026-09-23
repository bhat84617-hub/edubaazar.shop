-- Step 1: Create orders table (run this first)
CREATE TABLE IF NOT EXISTS public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'upi_qr',
  utr text,
  date timestamptz NOT NULL DEFAULT now()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(date DESC);

-- Step 3: Enable RLS (CRITICAL FIX 1: must be enabled, linter ERROR if disabled)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Also ensure users table (used by login/register) has RLS
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Step 4: SECURE RLS - Fix CRITICAL "RLS Disabled" + "Permissive Policy"
-- Previous bug: legacy/setup-tables.sql had "Allow all" FOR ALL USING (true) -> linter CRITICAL
-- This fix: anon can INSERT+SELECT only (needed by checkout/account/login), NO UPDATE/DELETE for anon,
-- service_role (server API routes: src/app/api/admin/*) has ALL. Prevents IDOR/data leaks.
DROP POLICY IF EXISTS "allow_insert" ON public.orders;
DROP POLICY IF EXISTS "allow_select" ON public.orders;
DROP POLICY IF EXISTS "allow_update" ON public.orders;
DROP POLICY IF EXISTS "allow_delete" ON public.orders;
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all on users" ON public.users;
DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users" ON public.users;
DROP POLICY IF EXISTS "service_role_all" ON public.orders;
DROP POLICY IF EXISTS "Allow service_role all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service_role all users" ON public.users;

-- Tighten grants: anon only gets INSERT, not SELECT/UPDATE/DELETE (linter flags overly permissive).
-- Account page reads orders via GET /api/orders (service_role), not anon key.
REVOKE ALL ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.orders TO anon, authenticated;
GRANT INSERT ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.users TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Orders: anon INSERT (guest checkout via src/lib/store.tsx placeOrder).
-- NO anon SELECT: order PII (name/email/UTR/download URLs) must only be read
-- via server API routes that use the service_role key after session checks.
CREATE POLICY "Allow anon insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow service_role all orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users: anon INSERT only (register goes through API routes with service_role anyway).
-- NO anon SELECT: prevents password hash/plaintext dump via PostgREST with the public anon key.
CREATE POLICY "Allow anon insert users" ON public.users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow service_role all users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Extra hardening: drop any previously-created permissive anon SELECT policies (idempotent)
DROP POLICY IF EXISTS "Allow anon select users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users for login" ON public.users;
DROP POLICY IF EXISTS "Allow anon select orders" ON public.orders;
DROP POLICY IF EXISTS "orders_anon_select" ON public.orders;
DROP POLICY IF EXISTS "users_anon_select" ON public.users;

-- CRITICAL FIX 2: function_search_path_mutable - fix any functions without SET search_path
-- (If you create functions later, always use SECURITY DEFINER SET search_path = '')
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
           FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.prokind IN ('f','p') LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''''', r.nspname, r.proname, r.args);
  END LOOP;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'search_path fix: %', SQLERRM; END $$;

-- CRITICAL FIX 3: Leaked Password Protection must be enabled in Dashboard
-- Auth -> Configuration -> Enable "Leaked password protection" (checks HaveIBeenPwned)
