import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Class {
  id: string;
  classe: string;
  plataforma_pes?: number;
  potencia?: string;
  preco_compra?: number;
  vida_util_anos?: number;
  valor_revenda_percent?: number;
  manutencao_percent?: number;
  seguro_percent?: number;
  rendimento_ha_hora?: number;
  usar_sugestoes?: boolean;
  quantidade_personalizada?: number;
  hectares_por_dia?: number;
  created_at?: string;
  updated_at?: string;
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      // Note: 'classes' table will be created via migration.
      // TypeScript types will be updated after running: supabase gen types --local
      const { data, error } = await (supabase as any)
        .from('classes')
        .select('*')
        .eq('usar_sugestoes', true)
        .order('classe', { ascending: true });

      if (error) throw error;
      return (data as Class[]) || [];
    },
  });
}
