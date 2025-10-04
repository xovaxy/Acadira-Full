-- Drop ALL existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles for their institution" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their institution" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their institution" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in their institution" ON profiles;

-- Create a helper function to check if current user is admin/super_admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to get current user's institution_id
CREATE OR REPLACE FUNCTION get_user_institution_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT institution_id FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Basic policies: Everyone can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

-- Basic policies: Everyone can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Basic policies: Everyone can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admin policies: Admins can view all profiles in their institution
CREATE POLICY "Admins can view institution profiles"
  ON profiles FOR SELECT
  USING (
    is_admin_user() 
    AND institution_id = get_user_institution_id()
  );

-- Admin policies: Admins can insert profiles in their institution
CREATE POLICY "Admins can insert institution profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    is_admin_user() 
    AND institution_id = get_user_institution_id()
  );

-- Admin policies: Admins can update profiles in their institution
CREATE POLICY "Admins can update institution profiles"
  ON profiles FOR UPDATE
  USING (
    is_admin_user() 
    AND institution_id = get_user_institution_id()
  );

-- Admin policies: Admins can delete profiles in their institution
CREATE POLICY "Admins can delete institution profiles"
  ON profiles FOR DELETE
  USING (
    is_admin_user() 
    AND institution_id = get_user_institution_id()
  );
