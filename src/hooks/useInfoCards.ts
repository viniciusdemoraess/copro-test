import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InfoCard, InfoCardCategory, categoryTabs } from '@/types/info-card';
import { useToast } from '@/hooks/use-toast';

// Fetch all cards (for admin)
export function useInfoCardsAdmin(category?: InfoCardCategory) {
  return useQuery({
    queryKey: ['info-cards-admin', category],
    queryFn: async () => {
      let query = supabase
        .from('info_cards')
        .select('*')
        .order('order_position', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as InfoCard[];
    },
  });
}

// Fetch active cards (for public site)
export function useInfoCards(category?: InfoCardCategory) {
  const query = useQuery({
    queryKey: ['info-cards', category],
    queryFn: async () => {
      let q = supabase
        .from('info_cards')
        .select('*')
        .eq('active', true)
        .order('order_position', { ascending: true });
      
      if (category) {
        q = q.eq('category', category);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      return data as InfoCard[];
    },
    staleTime: 5 * 60 * 1000,
  });
  
  return { cards: query.data ?? [], isLoading: query.isLoading, error: query.error };
}

// Get stats per category
export function useInfoCardStats() {
  const { data: cards } = useInfoCardsAdmin();
  
  const stats: Record<InfoCardCategory, { total: number; active: number }> = {
    beneficio: { total: 0, active: 0 },
    servico: { total: 0, active: 0 },
    geral: { total: 0, active: 0 },
    entrega: { total: 0, active: 0 },
  };
  
  if (cards) {
    cards.forEach(card => {
      const cat = card.category as InfoCardCategory;
      if (stats[cat]) {
        stats[cat].total++;
        if (card.active) stats[cat].active++;
      }
    });
  }
  
  // Filter to only return stats for active categories
  const activeCategoryIds = categoryTabs.map(tab => tab.id);
  const filteredStats: Partial<Record<InfoCardCategory, { total: number; active: number }>> = {};
  
  activeCategoryIds.forEach(catId => {
    filteredStats[catId] = stats[catId];
  });
  
  return filteredStats;
}

// Get next order position for a category
export function useNextOrderPosition(category: InfoCardCategory) {
  return useQuery({
    queryKey: ['info-cards-next-position', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('info_cards')
        .select('order_position')
        .eq('category', category)
        .order('order_position', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return (data?.order_position ?? 0) + 1;
    },
  });
}

// Create card
export function useCreateInfoCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (cardData: Omit<InfoCard, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('info_cards')
        .insert(cardData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info-cards'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-admin'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-next-position'] });
      toast({ title: 'Card criado com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar card', description: error.message, variant: 'destructive' });
    },
  });
}

// Update card
export function useUpdateInfoCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...cardData }: Partial<InfoCard> & { id: string }) => {
      const { data, error } = await supabase
        .from('info_cards')
        .update(cardData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info-cards'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-admin'] });
      toast({ title: 'Card atualizado com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar card', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete card
export function useDeleteInfoCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('info_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info-cards'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-admin'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-next-position'] });
      toast({ title: 'Card excluído com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir card', description: error.message, variant: 'destructive' });
    },
  });
}

// Toggle status
export function useToggleInfoCardStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('info_cards')
        .update({ active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['info-cards'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-admin'] });
      toast({ title: `Card ${active ? 'ativado' : 'desativado'}` });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    },
  });
}

// Reorder cards
export function useReorderInfoCards() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ cardId, newPosition }: { cardId: string; newPosition: number }) => {
      const { error } = await supabase.rpc('reorder_info_cards', {
        card_id: cardId,
        new_position: newPosition,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info-cards'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-admin'] });
      toast({ title: 'Ordem atualizada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao reordenar', description: error.message, variant: 'destructive' });
    },
  });
}

// Duplicate card
export function useDuplicateInfoCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (card: InfoCard) => {
      // Get next position
      const { data: positionData } = await supabase
        .from('info_cards')
        .select('order_position')
        .eq('category', card.category)
        .order('order_position', { ascending: false })
        .limit(1)
        .single();
      
      const nextPosition = (positionData?.order_position ?? 0) + 1;
      
      const { data, error } = await supabase
        .from('info_cards')
        .insert({
          title: `${card.title} - Cópia`,
          description: card.description,
          category: card.category,
          icon_name: card.icon_name,
          image_url: card.image_url,
          link_url: card.link_url,
          link_text: card.link_text,
          background_color: card.background_color,
          icon_color: card.icon_color,
          order_position: nextPosition,
          active: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info-cards'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-admin'] });
      queryClient.invalidateQueries({ queryKey: ['info-cards-next-position'] });
      toast({ title: 'Card duplicado com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao duplicar card', description: error.message, variant: 'destructive' });
    },
  });
}

// Upload image
export async function uploadCardImage(file: File): Promise<string> {
  // Validate file
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
    throw new Error('Formato de imagem inválido');
  }
  
  if (file.size > 1024 * 1024) {
    throw new Error('Imagem muito grande (máx 1MB)');
  }
  
  // Generate unique filename
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('card-images')
    .upload(`cards/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (uploadError) throw uploadError;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('card-images')
    .getPublicUrl(`cards/${fileName}`);
  
  return publicUrl;
}

// Delete image
export async function deleteCardImage(imageUrl: string) {
  try {
    const path = imageUrl.split('/card-images/')[1];
    if (path) {
      await supabase.storage.from('card-images').remove([path]);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
