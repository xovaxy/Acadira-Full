-- Add suspension_reason column to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Add suspended_at timestamp
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Add suspended_by (super admin who suspended it)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id);
