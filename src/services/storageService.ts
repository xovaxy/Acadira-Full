import { supabase } from '@/integrations/supabase/client';

export type FileUploadOptions = {
  bucket?: string;
  path: string;
  file: File;
  onProgress?: (progress: number) => void;
};

export const storageService = {
  // Upload file with progress
  async uploadFile({ bucket = 'curriculum', path, file, onProgress }: FileUploadOptions) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        onUploadProgress: onProgress ? ({ loaded, total }) => {
          const progress = (loaded / total) * 100;
          onProgress(progress);
        } : undefined
      });

    if (error) throw error;
    return data;
  },

  // Get public URL for file
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Download file
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  },

  // Delete file
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },

  // List files in a bucket/folder
  async listFiles(bucket: string, path?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || '');

    if (error) throw error;
    return data;
  },

  // Move/Copy file
  async moveFile(bucket: string, fromPath: string, toPath: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) throw error;
  },

  // Create signed URL (temporary access)
  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data;
  }
};