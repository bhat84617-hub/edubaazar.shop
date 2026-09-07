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

-- Step 3: Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 4: SECURE RLS - service_role only (anon cannot read/modify orders)
-- Drop permissive policies if they exist
DROP POLICY IF EXISTS "allow_insert" ON public.orders;
DROP POLICY IF EXISTS "allow_select" ON public.orders;
DROP POLICY IF EXISTS "allow_update" ON public.orders;
DROP POLICY IF EXISTS "allow_delete" ON public.orders;

-- Only service_role (server) can access orders. All client access must go via server API with admin session.
-- Anon users get NO direct access - prevents IDOR and data leaks
CREATE POLICY "service_role_all" ON public.orders FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Optional: if you need anon insert via server (with anon key), create restrictive insert:
-- Anon can only insert, not read/update/delete. But prefer service_role via API.
-- CREATE POLICY "anon_insert_only" ON public.orders FOR INSERT TO anon WITH CHECK (true);
