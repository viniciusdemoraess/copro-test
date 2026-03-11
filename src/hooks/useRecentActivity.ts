import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Activity, ActivityLog } from '@/types/activity';

interface UseRecentActivityReturn {
  activities: Activity[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useRecentActivity(limit: number = 10): UseRecentActivityReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          action,
          entity_type,
          entity_id,
          description,
          created_at,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      const formattedActivities: Activity[] = (data || []).map((log: any) => ({
        id: log.id,
        user: log.profiles ? {
          id: log.user_id,
          name: log.profiles.full_name || 'Usuário',
          email: log.profiles.email,
        } : null,
        action: log.action as 'create' | 'update' | 'delete',
        entityType: log.entity_type,
        description: log.description,
        createdAt: new Date(log.created_at),
      }));

      setActivities(formattedActivities);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('activity_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
}
