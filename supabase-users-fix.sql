-- EduBazar.shop — users table fix
-- PROBLEM: /api/auth/register returns 500 "Could not create account" on production.
-- Almost certainly the public.users table is missing (or has a wrong schema) in
-- your Supabase project, so the INSERT fails while SELECTs silently return 401.
--
-- HOW TO RUN:
-- 1. Open https://supabase.com/dashboard → your project → SQL Editor → New query
-- 2. Paste this whole file, press Run
-- 3. Then run the VERIFY query at the bottom — it must return 1 row.

-- 1. Create the table if it doesn't exist (safe to re-run)
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- 2. If the table already exists but is missing columns (old schema), add them
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT NOW();

-- 3. Backfill NOT NULL where safe (only if you added columns to an old table)
-- ALTER TABLE public.users ALTER COLUMN name SET NOT NULL;
-- ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;
-- ALTER TABLE public.users ALTER COLUMN password SET NOT NULL;

-- 4. Unique index on email (for fast login lookup + duplicate prevention)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 5. RLS: keep enabled, service_role bypasses it anyway (API routes use service_role)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Policies: service_role full access; anon can INSERT (register API uses service_role,
--    but keep the anon insert policy harmless). Drop-then-create to stay idempotent.
DROP POLICY IF EXISTS "Allow service_role all users" ON public.users;
CREATE POLICY "Allow service_role all users"
  ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert users" ON public.users;
CREATE POLICY "Allow anon insert users"
  ON public.users FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 7. Grants
GRANT INSERT ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- ============ VERIFY (run separately, must return exactly 1 row) ============
-- SELECT 'users table OK' AS status, COUNT(*) AS rows FROM public.users;
