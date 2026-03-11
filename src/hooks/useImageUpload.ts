import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateImage, compressImage, generateUniqueFileName } from '@/lib/image-compression';

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadImage: (file: File, path?: string) => Promise<string | null>;
  deleteImage: (url: string) => Promise<boolean>;
}

export function useImageUpload(bucket: string = 'carousel-images'): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File, path: string = 'slides'): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      // Validate image
      const validation = validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Erro na validação');
        return null;
      }

      // Compress if needed
      const imageFile = await compressImage(file);

      // Generate unique file name
      const fileName = generateUniqueFileName(file.name);
      const filePath = `${path}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [bucket]);

  const deleteImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === bucket);
      if (bucketIndex === -1) return false;
      
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting image:', deleteError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, [bucket]);

  return {
    uploading,
    error,
    uploadImage,
    deleteImage,
  };
}
