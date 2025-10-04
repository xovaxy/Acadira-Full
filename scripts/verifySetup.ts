import { supabase } from './supabaseClient';

const verifySetup = async () => {
  try {
    // Check auth user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin2@exampleacademy.com',
      password: 'Admin123!@#'
    });

    if (authError) {
      console.error('Auth verification failed:', authError);
      return;
    }

    console.log('Auth verification successful:', authData.user?.id);

    // Check institution
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .select('*')
      .eq('email', 'admin2@exampleacademy.com')
      .single();

    if (institutionError) {
      console.error('Institution verification failed:', institutionError);
      return;
    }

    console.log('Institution verification successful:', institution);

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin2@exampleacademy.com')
      .single();

    if (profileError) {
      console.error('Profile verification failed:', profileError);
      return;
    }

    console.log('Profile verification successful:', profile);

    console.log('----------------------------------------');
    console.log('All verifications passed!');
    console.log('Admin Login Credentials:');
    console.log('Email: admin2@exampleacademy.com');
    console.log('Password: Admin123!@#');
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error in verification:', error);
  }
};

verifySetup().then(() => {
  console.log('Verification process completed');
}).catch((error) => {
  console.error('Error in verification process:', error);
});