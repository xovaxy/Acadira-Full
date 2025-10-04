import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Institution = Database['public']['Tables']['institutions']['Row'];

export const superAdminService = {
  // Create new institution
  async createInstitution(institution: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) {
    // First verify the user is a super_admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (profileError) throw profileError;
    if (profile?.role !== 'super_admin') {
      throw new Error('Only super admins can create institutions');
    }

    // Create the institution
    const { data, error } = await supabase
      .from('institutions')
      .insert(institution)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create initial admin for an institution
  async createInstitutionAdmin(
    email: string,
    password: string,
    fullName: string,
    institutionId: string
  ) {
    // First verify the user is a super_admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (profileError) throw profileError;
    if (profile?.role !== 'super_admin') {
      throw new Error('Only super admins can create institution admins');
    }

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'admin'
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create admin profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email,
          full_name: fullName,
          role: 'admin',
          institution_id: institutionId
        });

      if (profileError) throw profileError;
    }

    return authData;
  }
};