# Supabase Critical Fixes — zzkjeimlnawgrkuwbban

## What was fixed
Project `zzkjeimlnawgrkuwbban` (edubaazar.shop) had **2 CRITICAL** Supabase linter errors:

| # | Error (Supabase Dashboard → Database → Lints / Advisors) | Root cause | Fix in this folder |
|---|-----------------------------------------------------------|------------|--------------------|
| 1 | `RLS disabled on public.orders / public.users` **OR** `Policy `Allow all` is overly permissive` (`ERROR`) | `legacy/setup-tables.sql` created `CREATE POLICY "Allow all" FOR ALL USING(true)` — anon could DELETE/UPDATE all orders & users (IDOR/data leak). Also RLS was disabled on some installs. | `supabase/fix-critical-bugs.sql` → `ENABLE ROW LEVEL SECURITY`, revokes anon SELECT/UPDATE/DELETE grants, re-creates restrictive policies: anon `INSERT` only, `service_role` `ALL`, `critical-fixes.sql` same. Account page reads orders via `GET /api/orders` (service_role). |
| 2 | `Function search_path mutable` (`ERROR`) | Any `SECURITY DEFINER` function without `SET search_path = ''` can be hijacked via search_path injection. Supabase flags every public function missing it. | `fix-critical-bugs.sql` DO block runs `ALTER FUNCTION … SET search_path = ''` on every function in `public` schema. Template for future funcs included as comment. |

**Bonus hardened:** `Leaked password protection` is a dashboard toggle (not SQL) — instructions below. `Extensions in public` note included (commented).

## Files
- `supabase/fix-critical-bugs.sql` — primary fix (idempotent, safe to re-run). Contains verification queries at bottom.
- `supabase/critical-fixes.sql` — identical copy (user requested either name).
- `supabase-setup.sql` — updated canonical setup that now correctly enables RLS for **both** `orders` + `users`, with the same restrictive policies + search_path fix + proper indexes & grants. New installs can just run this file.

## How to apply (2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/zzkjeimlnawgrkuwbban/sql/new
2. Copy-paste the **entire** contents of `supabase/fix-critical-bugs.sql` (or `supabase-setup.sql` if fresh DB) into the SQL Editor.
3. Click **Run** (or `Ctrl+Enter`). Wait for `Success. No rows returned` + verification tables at bottom show `rls_enabled = true`.
4. Fix **Leaked password protection** (2nd critical often):
   - Go to **Authentication → Configuration → Password Protection**
   - Enable **Leaked password protection** → Save.
   - Docs: https://supabase.com/docs/guides/auth/password-security
5. Verify (optional):
   - **Database → Advisors / Lints** — both CRITICAL errors should be gone (may need 5 min to re-scan, click Refresh).
   - Or re-run the verification queries at bottom of `fix-critical-bugs.sql` manually.

## Service-role key safety (audit)
- `src/lib/supabase-config.ts:2` → `SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY` (NO `NEXT_PUBLIC_` prefix — server-only, correct).
- `src/lib/config.ts` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` only for anon client (correct).
- All `src/app/api/**` routes use `SUPABASE_SERVICE_ROLE_KEY` via `createClient(url, key)` with `runtime="nodejs"` — server-side only, not leaked to client.
- `.env.example` contains placeholders only, no real secrets.

## What changed in app code vs DB
No app code change needed — `src/lib/store.tsx` already does `supabase.from("orders").insert` with anon key, which now correctly succeeds under the new `anon INSERT+SELECT` policies (previously would have failed if only `service_role` policy existed). Admin routes (`/api/admin/*`) continue to use `service_role` for UPDATE/DELETE.

## Re-run / rollback
Safe to re-run `fix-critical-bugs.sql` any time. To rollback (not recommended): `DROP POLICY …` then `ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY` — but you will re-introduce CRITICAL.

