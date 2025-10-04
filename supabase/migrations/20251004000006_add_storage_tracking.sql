-- Add storage tracking columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS storage_limit_gb DECIMAL(10,2) NOT NULL DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS storage_used_gb DECIMAL(10,2) NOT NULL DEFAULT 0.0;

-- Function to increment storage usage
CREATE OR REPLACE FUNCTION increment_storage_usage(inst_id UUID, size_mb DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET 
    storage_used_gb = storage_used_gb + (size_mb / 1024.0),
    updated_at = NOW()
  WHERE institution_id = inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storage usage percentage
CREATE OR REPLACE FUNCTION get_storage_percentage(inst_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  usage_percent DECIMAL;
BEGIN
  SELECT (storage_used_gb / storage_limit_gb * 100)
  INTO usage_percent
  FROM subscriptions
  WHERE institution_id = inst_id;
  
  RETURN COALESCE(usage_percent, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_storage_usage(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_storage_percentage(UUID) TO authenticated;

-- Comment on columns
COMMENT ON COLUMN subscriptions.storage_limit_gb IS 'Storage limit in gigabytes';
COMMENT ON COLUMN subscriptions.storage_used_gb IS 'Storage used in gigabytes';
