import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Podcast, PodcastOrderBy, PodcastStatusFilter } from '@/types/podcast';
import { useToast } from '@/hooks/use-toast';

export function usePodcasts(options?: {
  orderBy?: PodcastOrderBy;
  statusFilter?: PodcastStatusFilter;
  search?: string;
  adminView?: boolean;
}) {
  const { orderBy = 'manual', statusFilter = 'all', search = '', adminView = false } = options || {};

  return useQuery({
    queryKey: ['podcasts', { orderBy, statusFilter, search, adminView }],
    queryFn: async () => {
      let query = supabase.from('podcasts').select('*');

      // Status filter
      if (!adminView) {
        query = query.eq('active', true);
      } else if (statusFilter === 'active') {
        query = query.eq('active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('active', false);
      }

      // Search filter
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      // Order
      switch (orderBy) {
        case 'manual':
          query = query.order('order_position', { ascending: true });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'az':
          query = query.order('title', { ascending: true });
          break;
        case 'za':
          query = query.order('title', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Podcast[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePodcastStats() {
  return useQuery({
    queryKey: ['podcasts', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcasts')
        .select('active');
      
      if (error) throw error;

      const total = data.length;
      const active = data.filter(p => p.active).length;
      const inactive = total - active;

      return { total, active, inactive };
    },
  });
}

export function useCreatePodcast() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (podcast: Omit<Podcast, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('podcasts')
        .insert(podcast)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      toast({
        title: 'Sucesso',
        description: 'Podcast adicionado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar podcast',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePodcast() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Podcast> & { id: string }) => {
      const { data, error } = await supabase
        .from('podcasts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      toast({
        title: 'Sucesso',
        description: 'Podcast atualizado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar podcast',
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePodcast() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      toast({
        title: 'Sucesso',
        description: 'Podcast excluído com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir podcast',
        variant: 'destructive',
      });
    },
  });
}

export function useReorderPodcasts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ podcastId, newPosition }: { podcastId: string; newPosition: number }) => {
      const { error } = await supabase.rpc('reorder_podcasts', {
        podcast_id: podcastId,
        new_position: newPosition,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      toast({
        title: 'Sucesso',
        description: 'Ordem atualizada',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao reordenar',
        variant: 'destructive',
      });
    },
  });
}

export function useTogglePodcastStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('podcasts')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      toast({
        title: 'Sucesso',
        description: `Podcast ${active ? 'ativado' : 'desativado'}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar status',
        variant: 'destructive',
      });
    },
  });
}

export function useCheckDuplicateUrl() {
  return useMutation({
    mutationFn: async ({ url, excludeId }: { url: string; excludeId?: string }) => {
      let query = supabase
        .from('podcasts')
        .select('id')
        .eq('youtube_url', url);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.length > 0;
    },
  });
}

export function useNextOrderPosition() {
  return useQuery({
    queryKey: ['podcasts', 'nextOrder'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcasts')
        .select('order_position')
        .order('order_position', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data.length > 0 ? data[0].order_position + 1 : 1;
    },
  });
}
