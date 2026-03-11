import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface StatsIndicator {
  id: string;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  icon: string;
  active: boolean;
  order_position: number;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Buscar indicadores ativos (para o site público)
export function useStatsIndicators() {
  return useQuery({
    queryKey: ['stats-indicators'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('stats_indicators')
        .select('*')
        .eq('active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      return data as StatsIndicator[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Buscar todos os indicadores (para admin)
export function useStatsIndicatorsAdmin() {
  return useQuery({
    queryKey: ['stats-indicators-admin'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('stats_indicators')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      return data as StatsIndicator[];
    },
  });
}

// Criar indicador
export function useCreateStatsIndicator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      indicatorData: Omit<
        StatsIndicator,
        'id' | 'created_at' | 'updated_at' | 'created_by' | 'order_position'
      >
    ) => {
      // Verificar limite de 3 ativos
      if (indicatorData.active) {
        const { count } = await (supabase as any)
          .from('stats_indicators')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);

        if (count && count >= 3) {
          throw new Error('Máximo de 3 indicadores ativos permitidos');
        }
      }

      // Obter próxima posição
      const { data: lastIndicator } = await (supabase as any)
        .from('stats_indicators')
        .select('order_position')
        .order('order_position', { ascending: false })
        .limit(1)
        .single();

      const nextPosition = (lastIndicator?.order_position ?? 0) + 1;

      const { data, error } = await (supabase as any)
        .from('stats_indicators')
        .insert({
          ...indicatorData,
          order_position: nextPosition,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats-indicators'] });
      queryClient.invalidateQueries({ queryKey: ['stats-indicators-admin'] });
      toast({ title: 'Indicador criado com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar indicador',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Atualizar indicador
export function useUpdateStatsIndicator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...indicatorData
    }: Partial<StatsIndicator> & { id: string }) => {
      // Verificar limite se estiver ativando
      if (indicatorData.active === true) {
        const { count } = await (supabase as any)
          .from('stats_indicators')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)
          .neq('id', id);

        if (count && count >= 3) {
          throw new Error('Máximo de 3 indicadores ativos permitidos');
        }
      }

      const { data, error } = await (supabase as any)
        .from('stats_indicators')
        .update(indicatorData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats-indicators'] });
      queryClient.invalidateQueries({ queryKey: ['stats-indicators-admin'] });
      toast({ title: 'Indicador atualizado com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar indicador',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Deletar indicador
export function useDeleteStatsIndicator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('stats_indicators')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats-indicators'] });
      queryClient.invalidateQueries({ queryKey: ['stats-indicators-admin'] });
      toast({ title: 'Indicador excluído com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir indicador',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Alternar status
export function useToggleStatsIndicatorStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      // Verificar limite se estiver ativando
      if (active) {
        const { count } = await (supabase as any)
          .from('stats_indicators')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)
          .neq('id', id);

        if (count && count >= 3) {
          throw new Error('Máximo de 3 indicadores ativos permitidos');
        }
      }

      const { error } = await (supabase as any)
        .from('stats_indicators')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['stats-indicators'] });
      queryClient.invalidateQueries({ queryKey: ['stats-indicators-admin'] });
      toast({ title: `Indicador ${active ? 'ativado' : 'desativado'}` });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
