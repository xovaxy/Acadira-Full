-- Function to automatically expire subscriptions that have passed their end date
CREATE OR REPLACE FUNCTION auto_expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update subscriptions where end_date has passed and status is still active
  UPDATE subscriptions
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE 
    end_date < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function to check expiration on read
CREATE OR REPLACE FUNCTION check_subscription_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If end date has passed and status is active, change to expired
  IF NEW.end_date < NOW() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs before any update
CREATE TRIGGER trigger_check_subscription_expiration
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_expiration();

-- Also check on SELECT operations (create a view)
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.*,
  CASE 
    WHEN s.end_date < NOW() AND s.status = 'active' THEN 'expired'
    ELSE s.status
  END as computed_status
FROM subscriptions s;

-- Grant permissions
GRANT SELECT ON active_subscriptions TO authenticated;

-- Schedule function to run every hour using pg_cron (if available)
-- Note: This requires pg_cron extension to be enabled
-- Run manually: SELECT auto_expire_subscriptions();

-- Create a function that can be called from Edge Functions
CREATE OR REPLACE FUNCTION get_subscription_with_status(inst_id UUID)
RETURNS TABLE (
  id UUID,
  institution_id UUID,
  plan TEXT,
  status TEXT,
  monthly_question_limit INTEGER,
  current_usage INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  last_renewed TIMESTAMPTZ,
  suspension_reason TEXT,
  suspended_at TIMESTAMPTZ,
  suspended_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- First, auto-expire any that should be expired
  PERFORM auto_expire_subscriptions();
  
  -- Then return the subscription
  RETURN QUERY
  SELECT 
    s.id,
    s.institution_id,
    s.plan,
    CASE 
      WHEN s.end_date < NOW() AND s.status = 'active' THEN 'expired'::TEXT
      ELSE s.status
    END as status,
    s.monthly_question_limit,
    s.current_usage,
    s.start_date,
    s.end_date,
    s.last_renewed,
    s.suspension_reason,
    s.suspended_at,
    s.suspended_by,
    s.created_at,
    s.updated_at
  FROM subscriptions s
  WHERE s.institution_id = inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_subscription_with_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_expire_subscriptions() TO authenticated;

-- Run initial expiration check
SELECT auto_expire_subscriptions();
