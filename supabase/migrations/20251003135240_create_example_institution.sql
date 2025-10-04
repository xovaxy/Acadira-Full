-- First, create an example institution
INSERT INTO public.institutions (
    name,
    email,
    subscription_status,
    subscription_start_date,
    subscription_end_date
)
VALUES (
    'Example Academy',
    'admin@exampleacademy.com',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 year'
)
RETURNING id;

-- Now create an admin user for this institution
DO $$
DECLARE
    institution_id UUID;
    admin_email TEXT := 'admin@exampleacademy.com';
    admin_password TEXT := 'Admin123!@#';
    admin_name TEXT := 'John Admin';
    new_user_id UUID;
BEGIN
    -- Get the institution id we just created
    SELECT id INTO institution_id FROM public.institutions 
    WHERE email = 'admin@exampleacademy.com';

    -- Create the admin user using Supabase's create_user function
    SELECT id INTO new_user_id FROM auth.create_user(
        jsonb_build_object(
            'email', admin_email,
            'password', admin_password,
            'email_confirm', true,
            'user_metadata', jsonb_build_object('full_name', admin_name)
        )
    );

    -- Create the admin profile
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        institution_id
    )
    VALUES (
        new_user_id,
        admin_email,
        admin_name,
        'admin',
        institution_id
    );

    -- Output the credentials (for testing purposes)
    RAISE NOTICE 'Example Institution Admin Created:';
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Password: %', admin_password;
    RAISE NOTICE 'Institution ID: %', institution_id;
END $$;