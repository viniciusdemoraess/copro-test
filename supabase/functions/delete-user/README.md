# Edge Function: delete-user

Esta função deleta usuários administrativamente usando a Admin API do Supabase.

## Variáveis de Ambiente

As seguintes variáveis são automaticamente injetadas pelo Supabase quando a função é deployada:

- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (chave de administrador)

**IMPORTANTE:** Para validar tokens de usuário corretamente, você precisa adicionar manualmente:

- `SUPABASE_ANON_KEY` - Anon/Public Key (chave pública)

## Como Configurar

### Via Supabase Dashboard:

1. Acesse o projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Edge Functions** → **delete-user**
3. Clique em **Settings**
4. Adicione a variável de ambiente:
   - **Nome:** `SUPABASE_ANON_KEY`
   - **Valor:** Sua chave pública (anon key)
   - Você encontra essa chave em: **Project Settings** → **API** → **anon/public key**
5. Clique em **Save**

### Via Supabase CLI:

```bash
# As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetadas automaticamente
# Você precisa adicionar SUPABASE_ANON_KEY manualmente:

supabase secrets set SUPABASE_ANON_KEY=sua-anon-key-aqui
supabase functions deploy delete-user
```

## Uso

A função recebe um JSON com o seguinte campo:

```json
{
  "userId": "uuid-do-usuario"
}
```

## Resposta de Sucesso

```json
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

## Resposta de Erro

```json
{
  "error": "Mensagem de erro",
  "details": "Detalhes adicionais (opcional)"
}
```

## Segurança

- Apenas administradores podem deletar usuários
- Não é possível deletar a própria conta
- Requer token de autenticação válido
- Valida o token usando SUPABASE_ANON_KEY (se disponível)

## Notas Importantes

- Se `SUPABASE_ANON_KEY` não estiver configurada, a função tentará usar a service key como fallback, mas isso pode não funcionar corretamente para validar tokens de usuário
- Sempre configure `SUPABASE_ANON_KEY` para garantir validação correta de tokens
