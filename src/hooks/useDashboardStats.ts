import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DashboardStats } from '@/types/dashboard';

interface UseDashboardStatsReturn extends DashboardStats {
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidatos: 0,
    novosCandidatos: 0,
    totalPodcasts: 0,
    totalCards: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar total de candidatos
      const { count: totalCandidatos } = await supabase
        .from('association_forms')
        .select('*', { count: 'exact', head: true });

      // Buscar candidatos dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: novosCandidatos } = await supabase
        .from('association_forms')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Buscar total de podcasts ativos
      const { count: totalPodcasts } = await supabase
        .from('podcasts')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Buscar total de cards ativos
      const { count: totalCards } = await supabase
        .from('info_cards')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      setStats({
        totalCandidatos: totalCandidatos ?? 0,
        novosCandidatos: novosCandidatos ?? 0,
        totalPodcasts: totalPodcasts ?? 0,
        totalCards: totalCards ?? 0,
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    ...stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
