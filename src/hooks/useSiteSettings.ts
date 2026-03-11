import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_category: string;
  setting_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingUpdate {
  setting_key: string;
  setting_value: string;
  setting_category?: string;
  setting_description?: string;
}

export const useSiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const getSetting = (key: string): string | null => {
    const setting = settings?.find(s => s.setting_key === key);
    return setting?.setting_value || null;
  };

  const getSettingsByCategory = (category: string): SiteSetting[] => {
    return settings?.filter(s => s.setting_category === category) || [];
  };

  const updateSettingMutation = useMutation({
    mutationFn: async (update: SiteSettingUpdate) => {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: update.setting_key,
          setting_value: update.setting_value,
          setting_category: update.setting_category || 'general',
          setting_description: update.setting_description,
        }, {
          onConflict: 'setting_key',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Configuração atualizada',
        description: 'A configuração foi salva com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível salvar a configuração.',
      });
    },
  });

  const updateMultipleSettingsMutation = useMutation({
    mutationFn: async (updates: SiteSettingUpdate[]) => {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(
          updates.map(u => ({
            setting_key: u.setting_key,
            setting_value: u.setting_value,
            setting_category: u.setting_category || 'general',
            setting_description: u.setting_description,
          })),
          { onConflict: 'setting_key' }
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações foram salvas com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível salvar as configurações.',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    getSetting,
    getSettingsByCategory,
    updateSetting: updateSettingMutation.mutate,
    updateMultipleSettings: updateMultipleSettingsMutation.mutate,
    isUpdating: updateSettingMutation.isPending || updateMultipleSettingsMutation.isPending,
  };
};

export const usePublicSetting = (key: string) => {
  const { data: setting, isLoading } = useQuery({
    queryKey: ['site-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .single();

      if (error) return null;
      return data?.setting_value || null;
    },
  });

  return { value: setting, isLoading };
};
