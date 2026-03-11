import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Delete User Edge Function Called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização não fornecido' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Create admin client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Extract token from header
    const token = authHeader.replace('Bearer ', '');

    // Debug: Log token info
    console.log('🔍 DEBUG - Token info:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 30) + '...',
      tokenEnd: '...' + token.substring(token.length - 30),
      hasAnonKey: !!supabaseAnonKey,
      hasRequestAnonKey: !!req.headers.get('apikey'),
      requestAnonKeyLength: req.headers.get('apikey')?.length || 0,
    });

    // Verify the requesting user using Supabase client with anon key
    let user: any = null;
    let userError: Error | null = null;

    // Try to get anon key (from env or request headers)
    const anonKey = supabaseAnonKey || req.headers.get('apikey') || '';

    console.log('🔍 DEBUG - Validation setup:', {
      hasEnvAnonKey: !!supabaseAnonKey,
      hasRequestAnonKey: !!req.headers.get('apikey'),
      willUseAnonKey: !!anonKey,
      tokenLength: token.length,
    });

    if (anonKey) {
      // Use Supabase client with anon key to validate user token
      try {
        console.log(
          '🔍 DEBUG - Validating via Supabase client with anon key...'
        );

        const supabaseClient = createClient(supabaseUrl, anonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });

        // Validar o usuário autenticado passando o token diretamente
        const {
          data: { user: validatedUser },
          error: validatedError,
        } = await supabaseClient.auth.getUser(token);

        user = validatedUser;
        userError = validatedError;

        console.log('🔍 DEBUG - Token validation result:', {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          error: userError?.message,
          errorCode: (userError as any)?.code,
          errorStatus: (userError as any)?.status,
        });

        if (userError) {
          console.error('❌ Token validation failed:', {
            errorMessage: userError.message,
            errorName: userError.name,
            errorStack: userError.stack,
          });
        } else if (user) {
          console.log('✅ User validated successfully:', {
            id: user.id,
            email: user.email,
          });
        }
      } catch (clientError) {
        console.error('❌ Supabase client validation error:', clientError);
        userError =
          clientError instanceof Error
            ? clientError
            : new Error('Erro ao validar token via Supabase client');
      }
    } else {
      // Last resort: Try with service key (usually won't work for user tokens)
      console.warn('⚠️ No anon key available, trying service key (may fail)');
      try {
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: 'GET',
          headers: {
            Authorization: authHeader,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
          },
        });

        console.log('🔍 DEBUG - Service key validation response:', {
          status: authResponse.status,
          ok: authResponse.ok,
        });

        if (!authResponse.ok) {
          const errorData = await authResponse.json().catch(() => ({}));
          console.error('❌ Service key validation error:', errorData);
          userError = new Error(
            errorData.message ||
              errorData.error_description ||
              `Token inválido (${authResponse.status})`
          );
        } else {
          const userData = await authResponse.json();
          user = userData;
          console.log('✅ User validated via service key:', user.id);
        }
      } catch (fetchError) {
        console.error('❌ Service key validation error:', fetchError);
        userError =
          fetchError instanceof Error
            ? fetchError
            : new Error('Erro ao validar token');
      }
    }

    if (userError || !user) {
      console.error('❌ ERROR - Token validation failed:', {
        hasUser: !!user,
        errorMessage: userError?.message,
        errorName: userError?.name,
        errorCode: (userError as any)?.code,
        errorStatus: (userError as any)?.status,
        validationMethod: supabaseAnonKey ? 'anon-key-client' : 'fallback',
      });

      // Log detalhado do erro para debug
      const errorDetails = {
        hasAnonKey: !!supabaseAnonKey,
        hasRequestAnonKey: !!req.headers.get('apikey'),
        validationMethod: supabaseAnonKey
          ? 'anon-key-client'
          : req.headers.get('apikey')
          ? 'request-anon-key'
          : 'http-api-fallback',
        errorMessage: userError?.message,
        errorName: userError?.name,
        errorCode: (userError as any)?.code,
        errorStatus: (userError as any)?.status,
        tokenLength: token.length,
      };

      console.error(
        '❌ ERROR - Full validation failure details:',
        errorDetails
      );

      return new Response(
        JSON.stringify({
          error: 'Token inválido ou expirado',
          details: userError?.message,
          debug: errorDetails,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('✅ Token validated successfully. User:', {
      id: user.id,
      email: user.email,
    });

    // Check if user is admin
    const { data: isAdminCheck, error: adminCheckError } =
      await supabaseAdmin.rpc('is_admin', { _user_id: user.id });

    if (adminCheckError) {
      console.error('Error checking admin status:', adminCheckError);
      return new Response(
        JSON.stringify({
          error: 'Erro ao verificar permissões',
          details: adminCheckError.message,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!isAdminCheck) {
      return new Response(
        JSON.stringify({
          error: 'Apenas administradores podem deletar usuários',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao processar JSON da requisição' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { userId } = requestBody;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'ID do usuário não fornecido' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Você não pode deletar sua própria conta' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Delete user from auth (this will cascade delete profile and roles due to ON DELETE CASCADE)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(
        JSON.stringify({
          error: `Erro ao deletar usuário: ${deleteError.message}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log(`User ${userId} deleted successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário deletado com sucesso',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
