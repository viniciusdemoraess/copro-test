import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AboutContent {
  id: string;
  section_key: string;
  title: string;
  content: string;
  image_url: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useAboutContent(sectionKey?: string) {
  return useQuery({
    queryKey: sectionKey ? ['about-content', sectionKey] : ['about-content'],
    queryFn: async () => {
      if (sectionKey) {
        const { data, error } = await supabase
          .from('about_content')
          .select('*')
          .eq('section_key', sectionKey)
          .single();
        if (error) throw error;
        return data as AboutContent;
      }

      const { data, error } = await supabase
        .from('about_content')
        .select('*');
      if (error) throw error;
      return data as AboutContent[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAboutContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      section_key,
      title,
      content,
      image_url,
    }: {
      section_key: string;
      title: string;
      content: string;
      image_url?: string | null;
    }) => {
      const updateData: any = { title, content };
      if (image_url !== undefined) {
        updateData.image_url = image_url;
      }

      const { data, error } = await supabase
        .from('about_content')
        .update(updateData)
        .eq('section_key', section_key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
      toast({ title: 'Conteúdo atualizado com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar conteúdo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUploadAboutImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, section }: { file: File; section: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${section}_${Date.now()}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('about-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('about-images')
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao fazer upload da imagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
