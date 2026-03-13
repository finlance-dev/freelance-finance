-- ─── Payment Orders ─────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor

CREATE TABLE payment_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'pro_yearly')),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  slip_url TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can see their own orders, admin uses service_role
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON payment_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON payment_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for payment slips
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload slips
CREATE POLICY "Users can upload slips"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-slips' AND auth.role() = 'authenticated');

-- Allow public read for admin to view slips
CREATE POLICY "Public can view slips"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-slips');
