import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile, UserWithRole, UserFormData, UsersStats, UserRole } from '@/types/user';

export function useUsers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      console.log('Fetching users...');
      console.log('Current user ID:', user?.id);
      
      // Verificar se o usuário atual é admin usando a função do banco
      let isAdminCheck = false;
      if (user?.id) {
        const { data: adminCheck, error: adminCheckError } = await supabase
          .rpc('is_admin', { _user_id: user.id });
        
        isAdminCheck = adminCheck === true;
        console.log('Is current user admin (RPC)?', adminCheck, adminCheckError);
        
        // Também verificar diretamente
        const { data: directRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const hasAdminRole = directRoles?.some(r => r.role === 'admin');
        console.log('Has admin role (direct)?', hasAdminRole, directRoles);
      }
      
      // Testar RLS diretamente - ver quantos perfis conseguimos ver
      const { count: profilesCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      console.log('Total profiles count (RLS test):', profilesCount, countError);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        console.error('Error details:', {
          message: profilesError.message,
          code: profilesError.code,
          details: profilesError.details,
          hint: profilesError.hint,
        });
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles?.length || 0);
      console.log('Profile IDs:', profiles?.map(p => p.id) || []);

      // Get all roles from user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.warn('Error fetching user roles:', rolesError);
        console.warn('Error details:', {
          message: rolesError.message,
          code: rolesError.code,
          details: rolesError.details,
        });
        // Fallback: use default editor role
        return (profiles || []).map(profile => ({
          ...profile,
          is_active: profile.is_active ?? true,
          role: 'editor' as UserRole,
        }));
      }

      console.log('User roles fetched:', userRoles?.length || 0);
      console.log('User roles:', userRoles);

      // Create a map of user_id -> role (prioritize admin over editor)
      const rolesMap = new Map<string, UserRole>();
      userRoles?.forEach((ur: any) => {
        const currentRole = rolesMap.get(ur.user_id);
        // If user has admin role, keep it; otherwise use editor
        if (!currentRole || ur.role === 'admin') {
          rolesMap.set(ur.user_id, ur.role as UserRole);
        }
      });

      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        is_active: profile.is_active ?? true,
        role: rolesMap.get(profile.id) || 'editor',
      }));

      console.log('Users with roles:', usersWithRoles.length);
      console.log('Users list:', usersWithRoles.map(u => ({ id: u.id, email: u.email, role: u.role })));
      return usersWithRoles;
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<UserWithRole | null> => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get role using direct query to user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        console.warn('Error fetching user role:', roleError);
      }

      const role = (roleData?.role as UserRole) || 'editor';

      return {
        ...profile,
        is_active: profile.is_active ?? true,
        role,
      };
    },
    enabled: !!userId,
  });
}

export function useUsersStats() {
  const { data: users } = useUsers();

  const stats: UsersStats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    editors: users?.filter(u => u.role === 'editor').length || 0,
    active: users?.filter(u => u.is_active).length || 0,
    inactive: users?.filter(u => !u.is_active).length || 0,
  };

  return stats;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<UserProfile> }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          bio: data.bio,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({ title: 'Perfil atualizado com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error.message,
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      console.log('Updating user role:', { userId, newRole });
      
      // Prevent self-demotion
      if (userId === user?.id && newRole !== 'admin') {
        throw new Error('Você não pode remover seu próprio acesso de admin');
      }

      // Atualizar diretamente na tabela user_roles
      console.log('Updating role directly in user_roles table...');
      
      // Remover todos os roles existentes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Error deleting existing roles:', deleteError);
      }
      
      // Inserir o novo role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
        });
      
      if (insertError) {
        console.error('Error inserting new role:', insertError);
        throw new Error(insertError.message || 'Erro ao atualizar permissão');
      }
      
      console.log('Role updated successfully');
    },
    onSuccess: async () => {
      // Aguardar um pouco para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Invalidar e refetch queries
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.refetchQueries({ queryKey: ['users'] });
      
      toast({ title: 'Permissão atualizada com sucesso' });
    },
    onError: (error: Error) => {
      console.error('Error updating user role:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar permissão',
        description: error.message,
      });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      // Prevent self-deactivation
      if (userId === user?.id && !isActive) {
        throw new Error('Você não pode desativar sua própria conta');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: isActive ? 'Usuário ativado' : 'Usuário desativado',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar status',
        description: error.message,
      });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: UserFormData) => {
      console.log('Creating user with data:', { ...data, password: '***' });
      
      // Garantir que temos uma sessão válida e atualizada
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sessão inválida. Por favor, faça login novamente.');
      }
      
      // Tentar renovar o token se necessário
      try {
        const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshedSession?.session) {
          session = refreshedSession.session;
          console.log('Token refreshed successfully');
        }
      } catch (refreshErr) {
        console.warn('Could not refresh token, using existing session:', refreshErr);
      }
      
      // Verificar novamente se temos sessão válida
      if (!session) {
        throw new Error('Sessão inválida. Por favor, faça login novamente.');
      }
      
      // Obter o token de acesso atualizado
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        throw new Error('Token de acesso não disponível. Por favor, faça login novamente.');
      }

      // Fazer chamada direta via fetch para ter mais controle sobre o erro
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone: data.phone,
          bio: data.bio,
          role: data.role,
          is_active: data.is_active,
          created_by: user?.id,
        }),
      });

      // Ler o corpo da resposta
      const responseData = await response.json().catch(() => ({}));
      
      console.log('Function response status:', response.status);
      console.log('Function response data:', responseData);

      // Se não for sucesso, tratar o erro
      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Erro ${response.status}: ${response.statusText}`;
        
        // Se for erro 401, pode ser problema de autenticação
        if (response.status === 401) {
          // Tentar refresh uma última vez
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
          }
          throw new Error('Erro de autenticação. Por favor, recarregue a página e tente novamente.');
        }
        
        throw new Error(errorMessage);
      }

      // Se chegou aqui, foi sucesso
      const functionData = responseData;

      // Verificar se há erro no corpo da resposta
      if (functionData?.error) {
        throw new Error(functionData.error);
      }

      if (!functionData?.user) {
        throw new Error('Falha ao criar usuário: resposta inválida da função');
      }

      return functionData.user;
    },
    onSuccess: async (newUser) => {
      console.log('User created successfully:', newUser);
      
      // Aguardar um pouco para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidate and refetch users list
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      const result = await queryClient.refetchQueries({ queryKey: ['users'] });
      console.log('Users list refreshed, result:', result);
      
      toast({ title: 'Usuário criado com sucesso' });
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error);
      let message = error.message;
      if (message.includes('already registered') || message.includes('already exists') || message.includes('User already registered') || message.includes('já está em uso')) {
        message = 'Este email já está cadastrado';
      }
      toast({
        variant: 'destructive',
        title: 'Erro ao criar usuário',
        description: message,
      });
    },
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { full_name: string; phone?: string; bio?: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          bio: data.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({ title: 'Perfil atualizado com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error.message,
      });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // First verify current password by attempting to sign in
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) throw new Error('Usuário não encontrado');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Senha alterada com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar senha',
        description: error.message,
      });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Validate file size
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Imagem muito grande (máximo 2MB)');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('carousel-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('carousel-images')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({ title: 'Avatar atualizado com sucesso' });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar avatar',
        description: error.message,
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Prevent self-deletion
      if (userId === user?.id) {
        throw new Error('Você não pode deletar sua própria conta');
      }

      // Garantir que temos uma sessão válida e atualizada
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔍 DEBUG - Initial session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        tokenLength: session?.access_token?.length,
        tokenPreview: session?.access_token ? session.access_token.substring(0, 20) + '...' : null,
        expiresAt: session?.expires_at,
        expiresIn: session?.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : null,
        sessionError: sessionError?.message,
      });
      
      if (sessionError || !session) {
        console.error('🔍 DEBUG - Session error:', sessionError);
        throw new Error('Sessão inválida. Por favor, faça login novamente.');
      }

      // Tentar renovar o token se necessário
      try {
        const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
        console.log('🔍 DEBUG - Refresh attempt:', {
          refreshed: !!refreshedSession?.session,
          refreshError: refreshError?.message,
          newTokenLength: refreshedSession?.session?.access_token?.length,
        });
        
        if (!refreshError && refreshedSession?.session) {
          session = refreshedSession.session;
          console.log('✅ Token refreshed successfully');
        }
      } catch (refreshErr) {
        console.warn('⚠️ Could not refresh token, using existing session:', refreshErr);
      }

      // Verificar novamente se temos sessão válida
      if (!session) {
        console.error('🔍 DEBUG - No session after refresh');
        throw new Error('Sessão inválida. Por favor, faça login novamente.');
      }

      // Obter o token de acesso atualizado
      if (!session.access_token) {
        console.error('🔍 DEBUG - No access token in session');
        throw new Error('Token de acesso não disponível. Por favor, faça login novamente.');
      }

      console.log('🔍 DEBUG - Final token info:', {
        tokenLength: session.access_token.length,
        tokenPreview: session.access_token.substring(0, 30) + '...',
        expiresIn: session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : null,
      });

      // Call delete-user edge function
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      
      if (!SUPABASE_URL) {
        throw new Error('URL do Supabase não configurada');
      }

      console.log('🔍 DEBUG - Making request to edge function:', {
        url: `${SUPABASE_URL}/functions/v1/delete-user`,
        hasToken: !!session.access_token,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        userId,
      });

      let response: Response;
      try {
        response = await fetch(`${SUPABASE_URL}/functions/v1/delete-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          },
          body: JSON.stringify({ userId }),
        });
        
        console.log('🔍 DEBUG - Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        // Check if it's a network error
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          throw new Error(
            'Não foi possível conectar ao servidor. A função delete-user pode não estar deployada. ' +
            'Por favor, faça o deploy da edge function delete-user no Supabase.'
          );
        }
        throw new Error(`Erro de rede: ${fetchError instanceof Error ? fetchError.message : 'Erro desconhecido'}`);
      }

      let responseData: any = {};
      try {
        responseData = await response.json();
      } catch (jsonError) {
        // Se não conseguir fazer parse do JSON, pode ser que a função não exista
        if (!response.ok) {
          const text = await response.text().catch(() => '');
          throw new Error(
            `Erro ao deletar usuário: ${response.status} ${response.statusText}. ` +
            `A função delete-user pode não estar deployada. Resposta: ${text.substring(0, 200)}`
          );
        }
      }
      
      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Erro ${response.status}: ${response.statusText}`;
        const errorDetails = responseData?.details || '';
        
        console.error('Delete user error:', {
          status: response.status,
          error: errorMessage,
          details: errorDetails,
        });
        
        // Se for erro 401, pode ser problema de autenticação
        if (response.status === 401) {
          console.log('🔄 Attempting to refresh session due to 401 error...');
          // Tentar refresh uma última vez
          const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('❌ Session refresh failed:', refreshError);
            throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
          }
          
          if (refreshedData?.session?.access_token) {
            console.log('✅ Session refreshed, retrying request with new token...');
            
            // Tentar novamente com o novo token
            try {
              const retryResponse = await fetch(`${SUPABASE_URL}/functions/v1/delete-user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${refreshedData.session.access_token}`,
                  'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
                },
                body: JSON.stringify({ userId }),
              });

              const retryResponseData = await retryResponse.json().catch(() => ({}));
              
              console.log('🔍 DEBUG - Retry response:', {
                status: retryResponse.status,
                ok: retryResponse.ok,
              });

              if (!retryResponse.ok) {
                const retryErrorMessage = retryResponseData?.error || retryResponseData?.message || `Erro ${retryResponse.status}`;
                throw new Error(`Erro após refresh: ${retryErrorMessage}`);
              }

              if (retryResponseData?.error) {
                throw new Error(retryResponseData.error);
              }

              // Sucesso no retry!
              return retryResponseData;
            } catch (retryError) {
              console.error('❌ Retry failed:', {
                error: retryError,
                message: retryError instanceof Error ? retryError.message : 'Erro desconhecido',
                stack: retryError instanceof Error ? retryError.stack : undefined,
              });
              
              // Verificar se é erro de rede ou de autenticação
              if (retryError instanceof TypeError && retryError.message.includes('Failed to fetch')) {
                throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
              }
              
              // Se o erro contém detalhes da resposta, incluir
              const errorMessage = retryError instanceof Error 
                ? retryError.message 
                : 'Erro de autenticação. Por favor, recarregue a página e tente novamente.';
              
              throw new Error(errorMessage);
            }
          }
          
          throw new Error('Erro de autenticação. Por favor, recarregue a página e tente novamente.');
        }
        
        // Mensagem mais específica para erro 404 (função não encontrada)
        if (response.status === 404) {
          throw new Error(
            'A função delete-user não foi encontrada. Por favor, faça o deploy da edge function delete-user no Supabase.'
          );
        }
        
        // Incluir detalhes se disponíveis
        const fullErrorMessage = errorDetails 
          ? `${errorMessage}. Detalhes: ${errorDetails}`
          : errorMessage;
        
        throw new Error(fullErrorMessage);
      }

      if (responseData?.error) {
        throw new Error(responseData.error);
      }

      return responseData;
    },
    onSuccess: async () => {
      // Wait a bit to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidate and refetch users list
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.refetchQueries({ queryKey: ['users'] });
      
      toast({ title: 'Usuário deletado com sucesso' });
    },
    onError: (error: Error) => {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar usuário',
        description: error.message,
      });
    },
  });
}
