import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FeaturedVideo } from '@/types/media';

export function useFeaturedVideo(activeOnly: boolean = false) {
  return useQuery({
    queryKey: ['featured-video', activeOnly],
    queryFn: async () => {
      if (activeOnly) {
        const { data, error } = await supabase
          .from('featured_video')
          .select('*')
          .eq('active', true)
          .maybeSingle();
        
        if (error) throw error;
        return data as FeaturedVideo | null;
      } else {
        const { data, error } = await supabase
          .from('featured_video')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as FeaturedVideo[];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFeaturedVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (video: Omit<FeaturedVideo, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('featured_video')
        .insert(video)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-video'] });
    },
  });
}

export function useUpdateFeaturedVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeaturedVideo> & { id: string }) => {
      const { data, error } = await supabase
        .from('featured_video')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-video'] });
    },
  });
}

export function useDeleteFeaturedVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('featured_video')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-video'] });
    },
  });
}

export function useDeactivateOtherVideos() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (excludeId?: string) => {
      let query = supabase
        .from('featured_video')
        .update({ active: false })
        .eq('active', true);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-video'] });
    },
  });
}
