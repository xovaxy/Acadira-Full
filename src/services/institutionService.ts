import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Institution = Database['public']['Tables']['institutions']['Row'];

export const institutionService = {
  // Get all institutions
  async getAll() {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get institution by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new institution
  async create(institution: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('institutions')
      .insert(institution)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update institution
  async update(id: string, updates: Partial<Institution>) {
    const { data, error } = await supabase
      .from('institutions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete institution
  async delete(id: string) {
    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update subscription status
  async updateSubscription(id: string, status: 'active' | 'expired' | 'cancelled', endDate?: string) {
    const { data, error } = await supabase
      .from('institutions')
      .update({
        subscription_status: status,
        subscription_end_date: endDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};