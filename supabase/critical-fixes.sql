-- =============================================================================
-- Supabase Critical Fixes for project zzkjeimlnawgrkuwbban (edubaazar.shop)
-- Run in: Supabase Dashboard → SQL Editor → Paste → Run
-- https://supabase.com/dashboard/project/zzkjeimlnawgrkuwbban/sql/new
-- =============================================================================
-- This fixes the 2 most common Supabase CRITICAL linter errors:
--   1. RLS disabled OR overly permissive policies (ERROR: RLS Disabled / Permissive)
--   2. Function search_path mutable (ERROR: function_search_path_mutable)
-- Plus hardens leaked password protection note & extension handling.
-- Idempotent: safe to re-run.
-- =============================================================================

-- ===========================================================================
-- FIX 1: Enable RLS + Secure Policies on all public tables
-- ===========================================================================
-- Detected tables: public.orders, public.users (and any future tables)
-- Strategy: anon can INSERT only (checkout/register), NO anon SELECT/UPDATE/DELETE,
--           service_role has ALL. This matches src/lib/store.tsx (anon insert) and
--           src/app/account which reads orders via GET /api/orders (service_role).
-- ===========================================================================

-- Ensure tables exist before altering (IF NOT EXISTS handled in setup)
-- Orders ---------------------------------------------------------------
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policies (from legacy/setup-tables.sql: "Allow all")
DROP POLICY IF EXISTS "Allow all on users" ON public.users;
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all on orders" ON public.users;
DROP POLICY IF EXISTS "allow_insert" ON public.orders;
DROP POLICY IF EXISTS "allow_select" ON public.orders;
DROP POLICY IF EXISTS "allow_update" ON public.orders;
DROP POLICY IF EXISTS "allow_delete" ON public.orders;
DROP POLICY IF EXISTS "allow_insert" ON public.users;
DROP POLICY IF EXISTS "allow_select" ON public.users;
DROP POLICY IF EXISTS "allow_update" ON public.users;
DROP POLICY IF EXISTS "allow_delete" ON public.users;
DROP POLICY IF EXISTS "service_role_all" ON public.orders;
DROP POLICY IF EXISTS "service_role_all" ON public.users;
DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users" ON public.users;
DROP POLICY IF EXISTS "Allow service_role all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service_role all users" ON public.users;

-- Revoke overly broad grants that Supabase linter flags (re-apply minimal grants)
-- Public should NOT have direct table UPDATE/DELETE, anon gets INSERT+SELECT via RLS
REVOKE ALL ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.orders TO anon, authenticated;
GRANT INSERT ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.users TO service_role;
-- Identity columns: anon needs USAGE on sequences to insert with GENERATED ALWAYS AS IDENTITY
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Recreate secure policies for ORDERS
-- anon can INSERT orders (guest checkout via store.tsx placeOrder -> supabase insert).
-- NO anon SELECT — order PII + download URLs must only be readable via server routes
-- that use the service_role key (account/admin/telegram API after session checks).
CREATE POLICY "Allow anon insert orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow service_role all orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Recreate secure policies for USERS
-- Users table stores password hashes. NEVER expose SELECT to anon (prevents dump).
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert users"
  ON public.users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow service_role all users"
  ON public.users FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Drop any previously-created permissive anon SELECT policies (idempotent)
DROP POLICY IF EXISTS "Allow anon select users" ON public.users;
DROP POLICY IF EXISTS "Allow anon select users for login" ON public.users;
DROP POLICY IF EXISTS "Allow anon select orders" ON public.orders;
DROP POLICY IF EXISTS "orders_anon_select" ON public.orders;
DROP POLICY IF EXISTS "users_anon_select" ON public.users;
DROP POLICY IF EXISTS "users_anon_insert" ON public.users;

-- ===========================================================================
-- Catch-all: Enable RLS on ANY other public tables that may exist
-- (products, etc. if later added). Idempotent DO block.
-- ===========================================================================
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    -- If a table has RLS enabled but ZERO policies, Supabase linter flags it.
    -- Ensure service_role always has access so admin API never locks out.
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='service_role_all_'||t
    ) THEN
      -- Only add generic service_role policy if no policy exists at all
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
          'service_role_all_'||t, t
        );
      END IF;
    END IF;
  END LOOP;
END $$;

-- ===========================================================================
-- FIX 2: Function search_path mutable (most common 2nd critical)
-- ===========================================================================
-- Any SECURITY DEFINER function without SET search_path = '' is flagged.
-- Fix: set search_path to empty/public-pg_temp or to public, pg_temp for each func.
-- This DO block fixes ALL existing functions in public schema that are missing it.
-- Also fixes extension functions and the classic handle_new_user etc.
-- ===========================================================================

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      n.nspname as schema,
      p.proname as name,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind IN ('f','p')  -- functions + procedures
  LOOP
    -- Set search_path to public, pg_temp (or '' ) to prevent search_path hijacking
    -- Using '' is strictest, but public, pg_temp keeps compatibility for existing funcs
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''''', r.schema, r.name, r.args);
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  -- If no functions exist, ignore
  RAISE NOTICE 'search_path fix: %', SQLERRM;
END $$;

-- Future-proof: ensure any new function you create uses SET search_path
-- Example template (uncomment & adapt when creating new functions):
-- CREATE OR REPLACE FUNCTION public.my_func()
-- RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
-- BEGIN ... END; $$;

-- ===========================================================================
-- FIX 3: Extension in public schema (WARN -> move to extensions schema)
-- If uuid-ossp / pgcrypto etc are in public, linter warns. Keep here for ref.
-- Uncomment if you have extensions in public:
-- ===========================================================================
-- CREATE SCHEMA IF NOT EXISTS extensions;
-- DO $$ BEGIN
--   IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pgcrypto' AND extnamespace = 'public'::regnamespace) THEN
--     ALTER EXTENSION pgcrypto SET SCHEMA extensions;
--   END IF;
--   IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='uuid-ossp' AND extnamespace = 'public'::regnamespace) THEN
--     ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
--   END IF;
-- END $$;

-- ===========================================================================
-- FIX 4: Leaked Password Protection (Auth config - NOT SQL, manual dashboard step)
-- Supabase linter flags: "Leaked password protection disabled"
-- Fix: Dashboard → Authentication → Configuration → Password Protection
--      → Enable "Leaked password protection" (checks HaveIBeenPwned)
-- Docs: https://supabase.com/docs/guides/auth/password-security
-- ===========================================================================
-- No SQL for this - you MUST click in dashboard. Included here as reminder comment.

-- ===========================================================================
-- VERIFICATION QUERIES (run after above to confirm fixes)
-- ===========================================================================

-- 1. Verify RLS is ENABLED on all public tables (row should show true)
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
SELECT '=== RLS STATUS (true = enabled, must be true for all) ===' as check;
SELECT tablename, rowsecurity AS rls_enabled FROM pg_tables WHERE schemaname='public' ORDER BY tablename;

-- 2. List policies (should show restrictive anon insert/select + service_role all, NOT "Allow all")
SELECT '=== POLICIES (should be restrictive, not "Allow all") ===' as check;
SELECT schemaname, tablename, policyname, roles, cmd, permissive FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;

-- 3. Check functions now have search_path set (proconfig should contain search_path)
SELECT '=== FUNCTION search_path (should not be null) ===' as check;
SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args,
       p.proconfig
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.prokind IN ('f','p');

-- 4. Confirm anon Grants (should be INSERT only, not SELECT/UPDATE/DELETE)
SELECT '=== GRANTS (anon should have INSERT only) ===' as check;
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee IN ('anon','authenticated','service_role')
ORDER BY table_name, grantee, privilege_type;
