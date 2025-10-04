// Execute this SQL in your Supabase dashboard's SQL editor:

/*
-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions DISABLE ROW LEVEL SECURITY;

-- Create example institution (with a unique email)
INSERT INTO public.institutions (
    name,
    email,
    subscription_status,
    subscription_start_date,
    subscription_end_date
)
VALUES (
    'Example Academy 2',
    'admin2@exampleacademy.com',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 year'
)
RETURNING id;

-- Get the institution id
DO $$
DECLARE
    institution_id UUID;
    new_user_id UUID;
BEGIN
    -- Get the institution we just created
    SELECT id INTO institution_id FROM public.institutions 
    WHERE email = 'admin2@exampleacademy.com';

    -- Create admin profile
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        institution_id
    )
    -- Get the user id from auth.users
    SELECT id INTO new_user_id FROM auth.users
    WHERE email = 'admin2@exampleacademy.com';

    -- Create admin profile
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        institution_id
    )
    VALUES (
        new_user_id,
        'admin2@exampleacademy.com',
        'John Admin',
        'admin',
        institution_id
    );

    -- Re-enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
END $$;
*/

console.log(`
Please follow these steps:

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Create the admin user through Authentication > Users > "Create User"
   - Email: admin2@exampleacademy.com
   - Password: Admin123!@#

4. Copy and paste the SQL code above into the SQL editor
5. Execute the SQL

After completing these steps, you'll have:
- An example institution (Example Academy)
- An admin user with the following credentials:
  Email: admin2@exampleacademy.com
  Password: Admin123!@#
`);