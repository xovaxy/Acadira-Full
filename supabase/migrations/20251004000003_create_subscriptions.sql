-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'professional' CHECK (plan IN ('trial', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'cancelled')),
  monthly_question_limit INTEGER NOT NULL DEFAULT 10000,
  current_usage INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  last_renewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(institution_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can view their own subscription
CREATE POLICY "Admins can view their institution subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (
  institution_id IN (
    SELECT institution_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Super admins can view all subscriptions
CREATE POLICY "Super admins can view all subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- RLS Policy: Super admins can update all subscriptions
CREATE POLICY "Super admins can update all subscriptions"
ON subscriptions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- RLS Policy: Super admins can insert subscriptions
CREATE POLICY "Super admins can insert subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- RLS Policy: Super admins can delete subscriptions
CREATE POLICY "Super admins can delete subscriptions"
ON subscriptions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset monthly usage (call this monthly)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET current_usage = 0,
      updated_at = NOW()
  WHERE DATE_PART('day', NOW() - last_renewed) >= 30
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_subscription_usage(inst_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET current_usage = current_usage + 1,
      updated_at = NOW()
  WHERE institution_id = inst_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create default subscriptions for existing institutions
INSERT INTO subscriptions (institution_id, plan, status, monthly_question_limit)
SELECT 
  id,
  'professional',
  'active',
  10000
FROM institutions
WHERE id NOT IN (SELECT institution_id FROM subscriptions);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_institution_id ON subscriptions(institution_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
