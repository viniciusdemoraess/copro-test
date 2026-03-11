import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  isEditor: boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const getUserRoles = async (userId: string) => {
    try {
      console.log('=== Getting user roles for:', userId);

      // Buscar roles diretamente primeiro (mais confiável)
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log('Direct roles query result:', { roles, error });

      if (error) {
        console.error('Error fetching user roles:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      const roleValues = roles?.map(r => r.role) || [];
      const isAdminFromRoles = roleValues.includes('admin');
      const isEditorFromRoles = roleValues.includes('editor');

      // Verificar usando a função RPC is_admin também
      const { data: isAdminCheck, error: adminCheckError } = await supabase
        .rpc('is_admin', { _user_id: userId });

      console.log('RPC is_admin result:', { isAdminCheck, adminCheckError });

      // Priorizar roles diretos se disponíveis (mais confiável)
      // Se não conseguir ler roles diretos mas RPC funcionou, usar RPC
      const isAdmin = error
        ? (isAdminCheck === true)
        : (isAdminFromRoles || isAdminCheck === true);

      const isEditor = isEditorFromRoles || isAdmin;

      console.log('Final role determination:', {
        userId,
        rolesFromDB: roleValues,
        isAdminFromRoles,
        isAdminFromRPC: isAdminCheck,
        finalIsAdmin: isAdmin,
        finalIsEditor: isEditor,
        hadError: !!error
      });

      return {
        isAdmin,
        isEditor
      };
    } catch (error) {
      console.error('Exception in getUserRoles:', error);
      return {
        isAdmin: false,
        isEditor: false
      };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);

            const roles = await getUserRoles(session.user.id);
            setIsAdmin(roles.isAdmin);
            setIsEditor(roles.isEditor);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsEditor(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
        getUserRoles(session.user.id).then((roles) => {
          setIsAdmin(roles.isAdmin);
          setIsEditor(roles.isEditor);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = 'Erro ao fazer login';
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Por favor, confirme seu email antes de fazer login';
        }
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: message,
        });
        return { error: new Error(message) };
      }

      // Update roles after successful login
      if (data?.user) {
        const roles = await getUserRoles(data.user.id);
        setIsAdmin(roles.isAdmin);
        setIsEditor(roles.isEditor);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsEditor(false);
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshRoles = async () => {
    if (user?.id) {
      console.log('Refreshing roles for user:', user.id);
      const roles = await getUserRoles(user.id);
      setIsAdmin(roles.isAdmin);
      setIsEditor(roles.isEditor);
      console.log('Roles refreshed:', { isAdmin: roles.isAdmin, isEditor: roles.isEditor });
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin,
    isEditor,
    refreshRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
