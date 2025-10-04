import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const profileService = {
  // Get user profile by user ID
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, institutions(*)')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all profiles for an institution
  async getByInstitution(institutionId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('institution_id', institutionId);

    if (error) throw error;
    return data;
  },

  // Create new profile
  async create(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile
  async update(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete profile
  async delete(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get profiles by role
  async getByRole(role: 'admin' | 'student', institutionId?: string) {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', role);

    if (institutionId) {
      query = query.eq('institution_id', institutionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
};