-- Referral System Tables
-- Run this in Supabase SQL Editor

-- 1. Referral codes & tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_id UUID,
  referred_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

-- 2. Commission records
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  order_id UUID REFERENCES payment_orders(id),
  amount NUMERIC NOT NULL,
  rate NUMERIC DEFAULT 0.25,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  promptpay_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can read their own referrals
CREATE POLICY "Users can manage own referrals" ON referrals
  FOR ALL USING (auth.uid() = referrer_id);

-- Users can read their own commissions
CREATE POLICY "Users can read own commissions" ON commissions
  FOR SELECT USING (auth.uid() = referrer_id);

-- Users can manage own withdrawals
CREATE POLICY "Users can manage own withdrawals" ON withdrawals
  FOR ALL USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access referrals" ON referrals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access commissions" ON commissions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access withdrawals" ON withdrawals
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast referral code lookups
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON commissions(referrer_id);
