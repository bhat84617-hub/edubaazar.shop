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
    date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow all (simple setup)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
