import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Candidato, CandidatoStatus, CandidatosStats, CandidatosFilters, CandidatoHistory } from '@/types/candidato';
import { useToast } from '@/hooks/use-toast';

// Fetch candidates with filters
export function useCandidatos(filters: CandidatosFilters, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['candidatos', filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('association_forms')
        .select('*', { count: 'exact' });
      
      // Apply search filter
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`);
      }
      
      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Apply city filter
      if (filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }
      
      // Apply date filters
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      // Pagination and ordering
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        candidatos: data as Candidato[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
}

// Fetch single candidate
export function useCandidato(id: string | null) {
  return useQuery({
    queryKey: ['candidato', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('association_forms')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Candidato;
    },
    enabled: !!id,
  });
}

// Fetch statistics
export function useCandidatosStats() {
  return useQuery({
    queryKey: ['candidatos-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('association_forms')
        .select('status, created_at');
      
      if (error) throw error;
      
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const stats: CandidatosStats = {
        total: data.length,
        novos: data.filter(c => c.status === 'novo').length,
        emAnalise: data.filter(c => c.status === 'em_analise').length,
        aprovados: data.filter(c => c.status === 'aprovado').length,
        rejeitados: data.filter(c => c.status === 'rejeitado').length,
        ultimos7Dias: data.filter(c => new Date(c.created_at) >= sevenDaysAgo).length,
        ultimos30Dias: data.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length,
      };
      
      return stats;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch unique cities for filter
export function useCandidatosCities() {
  return useQuery({
    queryKey: ['candidatos-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('association_forms')
        .select('city')
        .not('city', 'is', null);
      
      if (error) throw error;
      
      const cities = [...new Set(data.map(c => c.city).filter(Boolean))].sort();
      return cities as string[];
    },
  });
}

// Update candidate status
export function useUpdateCandidatoStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, status, userId }: { id: string; status: CandidatoStatus; userId: string }) => {
      // Get current status for history
      const { data: current } = await supabase
        .from('association_forms')
        .select('status')
        .eq('id', id)
        .single();
      
      // Update status
      const { error } = await supabase
        .from('association_forms')
        .update({
          status,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Log history
      await supabase.from('candidato_history').insert({
        candidato_id: id,
        action_type: 'status_change',
        old_value: current?.status,
        new_value: status,
        user_id: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      queryClient.invalidateQueries({ queryKey: ['candidato'] });
      queryClient.invalidateQueries({ queryKey: ['candidatos-stats'] });
      toast({ title: 'Status atualizado com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    },
  });
}

// Update admin notes
export function useUpdateCandidatoNotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, notes, userId }: { id: string; notes: string; userId: string }) => {
      const { error } = await supabase
        .from('association_forms')
        .update({ admin_notes: notes })
        .eq('id', id);
      
      if (error) throw error;
      
      // Log history
      await supabase.from('candidato_history').insert({
        candidato_id: id,
        action_type: 'note_updated',
        new_value: notes,
        user_id: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato'] });
      toast({ title: 'Notas salvas com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao salvar notas', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete candidate
export function useDeleteCandidato() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('association_forms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      queryClient.invalidateQueries({ queryKey: ['candidatos-stats'] });
      toast({ title: 'Candidato excluído com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir candidato', description: error.message, variant: 'destructive' });
    },
  });
}

// Fetch candidate history
export function useCandidatoHistory(candidatoId: string | null) {
  return useQuery({
    queryKey: ['candidato-history', candidatoId],
    queryFn: async () => {
      if (!candidatoId) return [];
      
      const { data, error } = await supabase
        .from('candidato_history')
        .select('*, user:profiles(full_name)')
        .eq('candidato_id', candidatoId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CandidatoHistory[];
    },
    enabled: !!candidatoId,
  });
}

// Bulk update status
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ ids, status, userId }: { ids: string[]; status: CandidatoStatus; userId: string }) => {
      const { error } = await supabase
        .from('association_forms')
        .update({
          status,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .in('id', ids);
      
      if (error) throw error;
      
      // Log history for each
      const historyEntries = ids.map(id => ({
        candidato_id: id,
        action_type: 'status_change',
        new_value: status,
        user_id: userId,
        notes: 'Alteração em massa',
      }));
      
      await supabase.from('candidato_history').insert(historyEntries);
    },
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      queryClient.invalidateQueries({ queryKey: ['candidatos-stats'] });
      toast({ title: `Status de ${ids.length} candidatos atualizado` });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    },
  });
}

// Bulk delete
export function useBulkDeleteCandidatos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('association_forms')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      queryClient.invalidateQueries({ queryKey: ['candidatos-stats'] });
      queryClient.invalidateQueries({ queryKey: ['candidatos-chart'] });
      toast({ title: `${ids.length} candidatos excluídos` });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir candidatos', description: error.message, variant: 'destructive' });
    },
  });
}

// Fetch chart data aggregated by month
export interface CandidatosChartData {
  mes: string;
  total: number;
}

export interface CandidatosChartFilters {
  dateFrom?: string | null;
  dateTo?: string | null;
}

export function useCandidatosChartData(filters: CandidatosChartFilters = {}) {
  return useQuery({
    queryKey: ['candidatos-chart', filters],
    queryFn: async (): Promise<CandidatosChartData[]> => {
      // Determine date range
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      
      if (filters.dateFrom && filters.dateTo) {
        startDate = new Date(filters.dateFrom);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999); // End of selected day
      } else if (filters.dateFrom) {
        startDate = new Date(filters.dateFrom);
        startDate.setHours(0, 0, 0, 0);
        // If only start date, use current date as end
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999); // End of today
      } else if (filters.dateTo) {
        // If only end date, use start of last month
        endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999); // End of selected day
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1); // Start of last month
        startDate.setHours(0, 0, 0, 0);
      } else {
        // Default: start of last month to today
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1); // Start of last month
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999); // End of today
      }
      
      let query = supabase
        .from('association_forms')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group data by month
      const monthMap = new Map<string, number>();
      
      // Initialize all months in range with 0
      const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      
      const currentDate = new Date(startDate);
      currentDate.setDate(1); // Start of month
      
      while (currentDate <= endDate) {
        const monthKey = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        monthMap.set(monthKey, 0);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Count candidatos per month
      (data || []).forEach((candidato) => {
        const date = new Date(candidato.created_at);
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
        
        if (date >= startDate && date <= endDate) {
          monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
        }
      });
      
      // Convert to array and sort by date
      const result: CandidatosChartData[] = Array.from(monthMap.entries())
        .map(([mes, total]) => ({ mes, total }))
        .sort((a, b) => {
          // Parse month/year for sorting
          const [monthA, yearA] = a.mes.split(' ');
          const [monthB, yearB] = b.mes.split(' ');
          const monthIndexA = months.indexOf(monthA);
          const monthIndexB = months.indexOf(monthB);
          
          if (yearA !== yearB) {
            return parseInt(yearA) - parseInt(yearB);
          }
          return monthIndexA - monthIndexB;
        });
      
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch today and yesterday counts
export interface TodayYesterdayStats {
  today: number;
  yesterday: number;
}

export function useTodayYesterdayStats() {
  return useQuery({
    queryKey: ['candidatos-today-yesterday'],
    queryFn: async (): Promise<TodayYesterdayStats> => {
      const now = new Date();
      
      // Today: start of today to end of today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      // Yesterday: start of yesterday to end of yesterday
      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      
      // Fetch today count
      const { count: todayCount } = await supabase
        .from('association_forms')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());
      
      // Fetch yesterday count
      const { count: yesterdayCount } = await supabase
        .from('association_forms')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterdayStart.toISOString())
        .lte('created_at', yesterdayEnd.toISOString());
      
      return {
        today: todayCount || 0,
        yesterday: yesterdayCount || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
