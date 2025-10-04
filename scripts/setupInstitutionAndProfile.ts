import { supabase } from './supabaseClient';

const setupInstitutionAndProfile = async () => {
  try {
    // 1. Sign in as the admin user
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin2@exampleacademy.com',
      password: 'Admin123!@#'
    });

    if (signInError) {
      console.error('Error signing in:', signInError);
      return;
    }

    if (!authData.user) {
      console.error('No user found - please create the user first in Supabase dashboard');
      return;
    }

    console.log('Successfully signed in as:', authData.user.email);

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

    console.log('Success! Setup completed:');
    console.log('----------------------------------------');
    console.log('Email: admin2@exampleacademy.com');
    console.log('Password: Admin123!@#');
    console.log('User ID:', authData.user.id);
    console.log('Institution ID:', institution.id);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error in setup:', error);
  }
};

// Run the setup
setupInstitutionAndProfile()
  .then(() => console.log('Setup process completed'))
  .catch((error) => console.error('Setup process failed:', error));