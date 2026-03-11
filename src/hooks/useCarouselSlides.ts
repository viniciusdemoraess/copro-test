import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CarouselSlide } from '@/types/media';

export function useCarouselSlides(activeOnly: boolean = false) {
  return useQuery({
    queryKey: ['carousel-slides', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('carousel_slides')
        .select('*')
        .order('order_position', { ascending: true });
      
      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CarouselSlide[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSlide() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slide: Omit<CarouselSlide, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('carousel_slides')
        .insert(slide)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-slides'] });
    },
  });
}

export function useUpdateSlide() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CarouselSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from('carousel_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-slides'] });
    },
  });
}

export function useDeleteSlide() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('carousel_slides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-slides'] });
    },
  });
}

export function useReorderSlides() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ slideId, newPosition }: { slideId: string; newPosition: number }) => {
      const { error } = await supabase.rpc('reorder_carousel_slides', {
        slide_id: slideId,
        new_position: newPosition,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-slides'] });
    },
  });
}
