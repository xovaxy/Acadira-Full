-- Update the user_role enum to include super_admin
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Drop existing policies for institutions table
DROP POLICY IF EXISTS "Public institutions are viewable by all users" ON public.institutions;
DROP POLICY IF EXISTS "Institutions can only be created by authenticated users" ON public.institutions;
DROP POLICY IF EXISTS "Institutions can only be updated by admins" ON public.institutions;

-- Create new policies for institutions table
CREATE POLICY "Institutions are viewable by authenticated users"
ON public.institutions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only super admins can create institutions"
ON public.institutions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admins can update their own institution"
ON public.institutions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    AND profiles.institution_id = id
  )
);

-- Create initial super admin function
CREATE OR REPLACE FUNCTION create_initial_super_admin(
  email TEXT,
  password TEXT,
  full_name TEXT
) RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Create the user in auth.users
  user_id := (SELECT id FROM auth.users WHERE auth.users.email = create_initial_super_admin.email);
  
  IF user_id IS NULL THEN
    user_id := (
      SELECT id FROM auth.users
      WHERE email = create_initial_super_admin.email
    );
  END IF;

  -- Create the profile as super_admin
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (user_id, email, full_name, 'super_admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;