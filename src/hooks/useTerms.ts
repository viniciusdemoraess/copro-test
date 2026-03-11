import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const BUCKET_NAME = 'terms';
const TERMS_FILE_NAME = 'termos-associacao.pdf';

// Upload termo
export function useUploadTermo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      // Verificar se o usuário está autenticado
      if (!user) {
        throw new Error('Você precisa estar autenticado para fazer upload de termos');
      }

      // Verificar sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão expirada. Por favor, faça login novamente');
      }

      // Validar tipo de arquivo (aceitar PDF)
      if (file.type !== 'application/pdf') {
        throw new Error('Apenas arquivos PDF são permitidos');
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande (máximo 10MB)');
      }

      // Fazer upload substituindo o arquivo existente
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(TERMS_FILE_NAME, file, {
          cacheControl: '3600',
          upsert: true, // Substituir se já existir
        });

      if (uploadError) {
        // Melhorar mensagem de erro para RLS
        if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
          throw new Error('Erro de permissão: Verifique se o bucket "terms" foi criado e as políticas de segurança foram aplicadas. Execute a migração ou o script SQL fornecido.');
        }
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(TERMS_FILE_NAME);

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast({
        title: 'Termo enviado com sucesso',
        description: 'O arquivo foi atualizado no sistema.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar termo',
        description: error.message,
      });
    },
  });
}

// Obter URL do termo atual
export function useTermoUrl() {
  return useQuery({
    queryKey: ['terms', 'url'],
    queryFn: async () => {
      // Verificar se o arquivo existe
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 1,
          search: TERMS_FILE_NAME,
        });

      if (error) {
        throw error;
      }

      // Se não existir arquivo, retornar null
      if (!files || files.length === 0) {
        return null;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(TERMS_FILE_NAME);

      return publicUrl;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
}

// Listar arquivos de termos (para admin ver histórico)
export function useTermosList() {
  return useQuery({
    queryKey: ['terms', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
}

// Deletar termo
export function useDeleteTermo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (fileName: string) => {
      // Verificar se o usuário está autenticado
      if (!user) {
        throw new Error('Você precisa estar autenticado para deletar termos');
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          throw new Error('Erro de permissão: Verifique se as políticas de segurança foram aplicadas.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast({
        title: 'Termo excluído com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir termo',
        description: error.message,
      });
    },
  });
}
