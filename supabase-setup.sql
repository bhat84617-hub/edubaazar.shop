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

-- Step 4: Create policies one by one (run each separately if needed)
CREATE POLICY "allow_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "allow_update" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "allow_delete" ON public.orders FOR DELETE USING (true);
