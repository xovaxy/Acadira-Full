import { supabase } from './supabaseClient';

const checkSetup = async () => {
  try {
    // Check if we can sign in with the credentials
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin2@exampleacademy.com',
      password: 'Admin123!@#'
    });

    if (signInError) {
      console.error('❌ Authentication failed - User might not exist:', signInError.message);
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('User ID:', authData.user?.id);

    // Check institution
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .select('*')
      .eq('email', 'admin2@exampleacademy.com')
      .single();

    if (institutionError) {
      console.error('❌ Institution check failed:', institutionError.message);
    } else {
      console.log('✅ Institution exists:', {
        id: institution.id,
        name: institution.name
      });
    }

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin2@exampleacademy.com')
      .single();

    if (profileError) {
      console.error('❌ Profile check failed:', profileError.message);
    } else {
      console.log('✅ Profile exists:', {
        id: profile.id,
        role: profile.role
      });
    }

    console.log('\nCredentials Summary:');
    console.log('----------------------------------------');
    console.log('Email: admin2@exampleacademy.com');
    console.log('Password: Admin123!@#');
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error during verification:', error);
  }
};

// Run the check
checkSetup()
  .then(() => console.log('\nVerification completed'))
  .catch((error) => console.error('\nVerification failed:', error));