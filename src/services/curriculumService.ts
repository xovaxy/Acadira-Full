import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Curriculum = Database['public']['Tables']['curriculum']['Row'];

export const curriculumService = {
  // Get all curriculum items for an institution
  async getByInstitution(institutionId: string) {
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get curriculum item by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new curriculum item
  async create(curriculum: Omit<Curriculum, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('curriculum')
      .insert(curriculum)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete curriculum item
  async delete(id: string) {
    const { error } = await supabase
      .from('curriculum')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Upload curriculum file to storage
  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase
      .storage
      .from('curriculum')
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  // Get download URL for curriculum file
  getFileUrl(path: string) {
    const { data } = supabase
      .storage
      .from('curriculum')
      .getPublicUrl(path);

    return data.publicUrl;
  }
};