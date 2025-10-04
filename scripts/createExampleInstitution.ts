import { supabase } from './supabaseClient';

const createAdmin = async () => {
  // First check if user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', 'admin2@exampleacademy.com')
    .single();

  if (checkError) {
    console.log('Proceeding with new user creation as user not found');
  } else if (existingUser) {
    console.log('User already exists:', existingUser);
    return;
  }
  try {
    // 1. Sign up the admin user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin2@exampleacademy.com',
      password: 'Admin123!@#',
      options: {
        data: {
          full_name: 'John Admin'
        }
      }
    });

    if (signUpError) {
      console.error('Error creating auth user:', signUpError);
      return;
    }

    console.log('Auth user created:', authData.user?.id);

    if (!authData.user?.id) {
      console.error('No user ID returned');
      return;
    }

    // 2. Create institution
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .insert({
        name: 'Example Academy 2',
        email: 'admin2@exampleacademy.com',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (institutionError) {
      console.error('Error creating institution:', institutionError);
      return;
    }

    console.log('Institution created:', institution.id);

    // 3. Create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: 'admin2@exampleacademy.com',
        full_name: 'John Admin',
        role: 'admin',
        institution_id: institution.id
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('Success! Admin account created:');
    console.log('----------------------------------------');
    console.log('Email: admin2@exampleacademy.com');
    console.log('Password: Admin123!@#');
    console.log('User ID:', authData.user.id);
    console.log('Institution ID:', institution.id);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error in admin creation:', error);
  }
};

async function createExampleInstitution() {
  try {
    // First create the institution
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .insert({
        name: 'Example Academy',
        email: 'admin@exampleacademy.com',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (institutionError) throw institutionError;

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@exampleacademy.com',
      password: 'Admin123!@#',
      options: {
        data: {
          full_name: 'John Admin'
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create the admin profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: 'admin@exampleacademy.com',
          full_name: 'John Admin',
          role: 'admin',
          institution_id: institution.id
        });

      if (profileError) throw profileError;

      console.log('Example Institution and Admin created successfully!');
      console.log('Admin Credentials:');
      console.log('Email: admin@exampleacademy.com');
      console.log('Password: Admin123!@#');
      console.log('Institution ID:', institution.id);
    }
  } catch (error) {
    console.error('Error creating example institution:', error);
  }
}

// Execute the function
createAdmin().then(() => {
  console.log('Admin creation process completed');
}).catch((error) => {
  console.error('Error in admin creation process:', error);
});