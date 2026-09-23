-- Run this in Supabase SQL Editor if tables don't exist
-- https://supabase.com/dashboard → SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    items JSONB,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_id TEXT,
    utr TEXT,
    date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr TEXT;

-- Enable RLS with least privilege (service_role bypasses RLS for admin ops)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on users" ON users;
DROP POLICY IF EXISTS "Allow all on orders" ON orders;

-- Anon: INSERT only (registration + order placement); no SELECT/UPDATE/DELETE
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users: read/update own rows only
CREATE POLICY "user_select_own" ON users FOR SELECT TO authenticated USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "user_update_own" ON users FOR UPDATE TO authenticated USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "user_select_orders" ON orders FOR SELECT TO authenticated USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "user_insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (email = (auth.jwt() ->> 'email'));

REVOKE ALL ON users FROM anon;
REVOKE ALL ON orders FROM anon;
GRANT INSERT ON users TO anon;
GRANT INSERT ON orders TO anon;
