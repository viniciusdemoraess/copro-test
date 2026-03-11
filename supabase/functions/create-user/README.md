# Edge Function: create-user

Esta função cria usuários administrativamente usando a Admin API do Supabase, sem rate limiting.

## Variáveis de Ambiente

As seguintes variáveis são automaticamente injetadas pelo Supabase quando a função é deployada:

- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (chave de administrador)

## Como Configurar

### Via Supabase Dashboard:

1. Acesse o projeto no Supabase Dashboard
2. Vá em **Edge Functions** → **create-user**
3. Clique em **Settings**
4. Adicione as variáveis de ambiente se necessário (geralmente já estão configuradas automaticamente)

### Via CLI:

```bash
# As variáveis são automaticamente injetadas durante o deploy
supabase functions deploy create-user
```

## Uso

A função recebe um JSON com os seguintes campos:

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "full_name": "Nome Completo",
  "phone": "(65) 99999-9999",
  "bio": "Biografia opcional",
  "role": "admin" | "editor",
  "is_active": true,
  "created_by": "uuid-do-criador"
}
```

## Resposta de Sucesso

```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    ...
  }
}
```

## Resposta de Erro

```json
{
  "error": "Mensagem de erro",
  "details": "Stack trace (apenas em desenvolvimento)"
}
```
