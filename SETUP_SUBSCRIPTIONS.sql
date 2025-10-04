-- First, check if subscriptions table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'subscriptions'
);

-- If the table doesn't exist, run the migration first!
-- Then run this to create subscriptions for all existing institutions:

INSERT INTO subscriptions (institution_id, plan, status, monthly_question_limit, current_usage, start_date, end_date)
SELECT 
  id as institution_id,
  'professional' as plan,
  'active' as status,
  10000 as monthly_question_limit,
  0 as current_usage,
  NOW() as start_date,
  (NOW() + INTERVAL '30 days') as end_date
FROM institutions
WHERE id NOT IN (SELECT institution_id FROM subscriptions)
ON CONFLICT (institution_id) DO NOTHING;

-- Verify subscriptions were created
SELECT 
  i.name,
  s.plan,
  s.status,
  s.monthly_question_limit,
  s.current_usage,
  s.end_date
FROM institutions i
LEFT JOIN subscriptions s ON s.institution_id = i.id
ORDER BY i.created_at DESC;
