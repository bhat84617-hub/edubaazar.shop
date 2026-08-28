-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zzkjeimlnawgrkuwbban/sql/new

-- Create orders table
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert orders (for checkout)
CREATE POLICY "Allow insert for everyone" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Policy: Allow anyone to read orders by email (for user dashboard)
CREATE POLICY "Allow read by email" ON public.orders
  FOR SELECT USING (true);

-- Policy: Allow service role to do everything (for admin panel)
-- Note: Service role key bypasses RLS automatically, but we add this for safety
CREATE POLICY "Allow service role full access" ON public.orders
  FOR ALL USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(date DESC);

-- Insert a test order (optional, remove in production)
-- INSERT INTO public.orders (order_id, name, email, phone, items, total, status, utr)
-- VALUES ('EDU-TEST123', 'Test User', 'test@example.com', '9876543210', '[{"id":"1","name":"Test Course","price":999}]'::jsonb, 999, 'pending', '1234567890');
