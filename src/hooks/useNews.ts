import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  slug: string;
  active: boolean;
  order_position: number;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useNews(limit?: number) {
  return useQuery({
    queryKey: limit ? ['news', limit] : ['news'],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as News[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewsAdmin() {
  return useQuery({
    queryKey: ['news-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as News[];
    },
  });
}

export function useNewsBySlug(slug: string) {
  return useQuery({
    queryKey: ['news', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;
      return data as News;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newsData: Omit<News, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('news')
        .insert({
          ...newsData,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      toast({ title: 'Notícia criada com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar notícia',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...newsData }: Partial<News> & { id: string }) => {
      const { data, error } = await supabase
        .from('news')
        .update(newsData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      toast({ title: 'Notícia atualizada com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar notícia',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('news').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      toast({ title: 'Notícia excluída com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir notícia',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUploadNewsImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
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
