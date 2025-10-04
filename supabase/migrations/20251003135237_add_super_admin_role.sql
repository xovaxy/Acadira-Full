-- Update the user_role enum to include super_admin
BEGIN;
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
COMMIT;