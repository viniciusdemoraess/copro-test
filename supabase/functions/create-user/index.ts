import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Validação de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de senha
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

serve(async (req) => {
  console.log('=== Edge Function Called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Wrap everything to ensure we always return a Response
  try {
    // Parse request body safely
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', {
        ...requestBody,
        password: '***',
      });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar JSON da requisição' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const {
      email,
      password,
      full_name,
      phone,
      bio,
      role,
      is_active,
      created_by,
    } = requestBody;

    // Validações
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!isValidPassword(password)) {
      return new Response(
        JSON.stringify({ error: 'Senha deve ter no mínimo 8 caracteres' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (role && !['admin', 'editor'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Role inválido. Use "admin" ou "editor"' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: 'Configuração do servidor incompleta',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Validar JWT do usuário que está fazendo a requisição
    const authHeader = req.headers.get('Authorization');
    let requestingUser: any = null;
    let jwtValid = false;
    let jwtError: Error | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const anonKey = supabaseAnonKey || req.headers.get('apikey') || '';

      console.log('🔍 DEBUG - Validating JWT for create-user request:', {
        hasAuthHeader: !!authHeader,
        hasAnonKey: !!anonKey,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 30) + '...',
      });

      if (anonKey) {
        try {
          const supabaseClient = createClient(supabaseUrl, anonKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });

          const {
            data: { user: validatedUser },
            error: validatedError,
          } = await supabaseClient.auth.getUser(token);

          requestingUser = validatedUser;
          jwtError = validatedError;

          if (!jwtError && requestingUser) {
            jwtValid = true;
            console.log('✅ JWT VÁLIDO - Usuário autenticado:', {
              userId: requestingUser.id,
              email: requestingUser.email,
              isValid: true,
            });
          } else {
            console.log('❌ JWT INVÁLIDO:', {
              error: jwtError?.message,
              errorCode: (jwtError as any)?.code,
              isValid: false,
            });
          }
        } catch (clientError) {
          jwtError =
            clientError instanceof Error
              ? clientError
              : new Error('Erro ao validar JWT');
          console.error('❌ Erro ao validar JWT:', {
            error: jwtError.message,
            isValid: false,
          });
        }
      } else {
        console.warn('⚠️ Nenhuma anon key disponível para validar JWT');
      }
    } else {
      console.warn('⚠️ Nenhum header Authorization encontrado');
    }

    // Log final do status do JWT
    console.log('📋 RESUMO DA VALIDAÇÃO JWT:', {
      jwtValid: jwtValid,
      hasUser: !!requestingUser,
      userId: requestingUser?.id,
      userEmail: requestingUser?.email,
      error: jwtError?.message || null,
    });

    // Verificar se o usuário é admin (se JWT foi validado)
    if (jwtValid && requestingUser) {
      // Create admin client temporário para verificar permissões
      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { data: isAdminCheck, error: adminCheckError } =
          await adminClient.rpc('is_admin', { _user_id: requestingUser.id });

        if (adminCheckError) {
          console.error(
            'Erro ao verificar se usuário é admin:',
            adminCheckError
          );
        } else {
          console.log('🔐 Verificação de admin:', {
            userId: requestingUser.id,
            isAdmin: isAdminCheck,
          });

          if (!isAdminCheck) {
            return new Response(
              JSON.stringify({
                error: 'Apenas administradores podem criar usuários',
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
              }
            );
          }
        }
      } catch (adminCheckError) {
        console.error('Erro ao verificar admin:', adminCheckError);
        // Continuar mesmo se houver erro na verificação
      }
    } else if (jwtValid === false && authHeader) {
      // Se tentou validar mas falhou
      console.log('❌ Bloqueando criação: JWT inválido');
      return new Response(
        JSON.stringify({
          error: 'Token inválido ou expirado',
          details: jwtError?.message,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Create admin client para operações administrativas
    let supabaseAdmin;
    try {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (clientError) {
      return new Response(
        JSON.stringify({
          error: `Erro ao criar cliente Supabase: ${clientError.message}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Verificar se email já existe
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (!listError && existingUsers?.users) {
      const userExists = existingUsers.users.some((u) => u.email === email);
      if (userExists) {
        return new Response(JSON.stringify({ error: 'Email já está em uso' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

    // Criar usuário
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name || '',
        },
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          error: `Erro ao criar usuário: ${authError.message}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!authData?.user) {
      return new Response(
        JSON.stringify({
          error: 'Falha ao criar usuário: nenhum usuário retornado',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const userId = authData.user.id;

    // Aguardar trigger criar perfil (com retry)
    let profileExists = false;
    let retries = 0;
    const maxRetries = 10;

    while (!profileExists && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (profile && !profileError) {
        profileExists = true;
      }
      retries++;
    }

    // Atualizar perfil com dados adicionais
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        phone: phone || null,
        bio: bio || null,
        is_active: is_active !== undefined ? is_active : true,
        created_by: created_by || null,
        full_name: full_name || null,
      })
      .eq('id', userId);

    if (profileUpdateError) {
      // Se o perfil não existe ainda, criar manualmente
      if (profileUpdateError.code === 'PGRST116') {
        const { error: createError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            email: authData.user.email || email,
            full_name: full_name || null,
            phone: phone || null,
            bio: bio || null,
            is_active: is_active !== undefined ? is_active : true,
            created_by: created_by || null,
          });

        if (createError) {
          // Tentar limpar usuário criado
          try {
            await supabaseAdmin.auth.admin.deleteUser(userId);
          } catch (deleteError) {
            console.error(
              'Error deleting user after profile creation failure:',
              deleteError
            );
          }
          return new Response(
            JSON.stringify({
              error: `Erro ao criar perfil: ${createError.message}`,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      } else {
        // Outro erro na atualização
        console.error('Error updating profile:', profileUpdateError);
        // Não falhar a criação do usuário por causa disso
      }
    }

    // Definir role (sempre criar, mesmo que não seja fornecido, usa 'editor' como padrão)
    const roleToAssign = role || 'editor';
    console.log(`Setting role "${roleToAssign}" for user ${userId}`);

    try {
      // Aguardar um pouco para garantir que o trigger já executou
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Verificar quais roles já existem para este usuário
      const { data: existingRoles, error: listError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (listError) {
        console.error('Error listing existing roles:', listError);
      } else {
        console.log('Existing roles:', existingRoles?.map((r) => r.role) || []);
      }

      // Se estamos criando 'admin', remover 'editor' primeiro
      if (roleToAssign === 'admin') {
        const hasEditor = existingRoles?.some((r) => r.role === 'editor');
        if (hasEditor) {
          console.log('Removing default editor role before assigning admin');
          const { error: deleteError } = await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', 'editor');

          if (deleteError) {
            console.error('Error deleting editor role:', deleteError);
          } else {
            console.log('Editor role removed successfully');
          }
        }
      }

      // Verificar se o role que queremos já existe
      const roleExists = existingRoles?.some((r) => r.role === roleToAssign);

      if (!roleExists) {
        console.log(`Inserting role "${roleToAssign}" for user ${userId}`);
        const { data: insertedRole, error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: roleToAssign,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting user role:', insertError);
          console.error('Role insert details:', {
            user_id: userId,
            role: roleToAssign,
            error: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          });

          // Tentar upsert como fallback
          console.log('Trying upsert as fallback...');
          const { error: upsertError } = await supabaseAdmin
            .from('user_roles')
            .upsert(
              {
                user_id: userId,
                role: roleToAssign,
              },
              {
                onConflict: 'user_id,role',
              }
            );

          if (upsertError) {
            console.error('Upsert also failed:', upsertError);
            // Retornar aviso mas não falhar completamente
            console.warn('User created but role assignment failed');
          } else {
            console.log('Upsert succeeded');
          }
        } else {
          console.log('Role inserted successfully:', insertedRole);
        }
      } else {
        console.log(`Role "${roleToAssign}" already exists, skipping insert`);
      }

      // Verificar novamente para confirmar
      const { data: finalRoles, error: finalCheckError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (finalCheckError) {
        console.error('Error verifying final roles:', finalCheckError);
      } else {
        console.log(
          'Final roles for user:',
          finalRoles?.map((r) => r.role) || []
        );
      }
    } catch (roleException) {
      console.error('Exception setting user role:', roleException);
      // Não retornar erro, apenas logar - o usuário já foi criado
    }

    // Success response
    return new Response(JSON.stringify({ user: authData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Final catch-all for any unexpected errors
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: `Erro inesperado: ${errorMessage}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
