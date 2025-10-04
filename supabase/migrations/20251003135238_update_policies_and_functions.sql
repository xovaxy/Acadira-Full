-- First disable RLS on institutions table
ALTER TABLE public.institutions DISABLE ROW LEVEL SECURITY;

-- Create temporary unrestricted policy
CREATE POLICY "Temporary unrestricted access"
ON public.institutions
TO authenticated
USING (true)
WITH CHECK (true);

-- Create initial super admin function
CREATE OR REPLACE FUNCTION create_initial_super_admin(
  email TEXT,
  password TEXT,
  full_name TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create the user in auth.users if it doesn't exist
  INSERT INTO auth.users (email, password_hash, raw_user_meta_data)
  VALUES (
    email,
    crypt(password, gen_salt('bf')),
    jsonb_build_object('full_name', full_name)
  )
  ON CONFLICT (email) DO UPDATE 
  SET raw_user_meta_data = jsonb_build_object('full_name', full_name)
  RETURNING id INTO new_user_id;

  -- Create the profile as super_admin
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (new_user_id, email, full_name, 'super_admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'super_admin';

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;