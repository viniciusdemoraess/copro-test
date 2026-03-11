import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PopupVideo } from '@/types/media';

export function usePopupVideo(activeOnly: boolean = false) {
  return useQuery({
    queryKey: ['popup-video', activeOnly],
    queryFn: async () => {
      if (activeOnly) {
        const { data, error } = await supabase
          .from('popup_video')
          .select('*')
          .eq('active', true)
          .maybeSingle();
        
        if (error) throw error;
        return data as PopupVideo | null;
      } else {
        const { data, error } = await supabase
          .from('popup_video')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as PopupVideo[];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePopupVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (video: Omit<PopupVideo, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('popup_video')
        .insert(video)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-video'] });
    },
  });
}

export function useUpdatePopupVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PopupVideo> & { id: string }) => {
      const { data, error } = await supabase
        .from('popup_video')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-video'] });
    },
  });
}

export function useDeletePopupVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('popup_video')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-video'] });
    },
  });
}

export function useDeactivateOtherPopups() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (excludeId?: string) => {
      let query = supabase
        .from('popup_video')
        .update({ active: false })
        .eq('active', true);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-video'] });
    },
  });
}
