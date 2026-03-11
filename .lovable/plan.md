
## Plano: Remover Linha Temporal + Corrigir Erros de Build

### Parte 1: Remover Seção Linha Temporal

A seção "Linha Temporal" aparece em vários lugares que precisam ser modificados:

**1. Arquivo `src/pages/Index.tsx`**
- Remover importação do `TimelineSection`
- Remover o componente `<TimelineSection />` do render

**2. Arquivo `src/components/Header.tsx`**
- Remover o link "Linha Temporal" da navegação desktop (linhas 121-127)
- Remover o link "Linha Temporal" da navegação mobile (linhas 170-179)

**3. Deletar arquivo `src/components/TimelineSection.tsx`**
- O componente não será mais utilizado

**4. Arquivo `src/components/WhyChoose.tsx`**
- Este componente também tem uma seção de linha temporal (linhas 57-79) com as imagens
- Verificar se este componente ainda é usado; se não, pode ser removido também

**5. Assets (opcional)**
- As imagens `timeline-part1.png`, `timeline-part2.png` e `timeline-part1.jpg` podem ser mantidas ou removidas posteriormente

---

### Parte 2: Corrigir Erros de Build

**1. Edge Function `create-user/index.ts` (linha 261)**
- Erro: `'clientError' is of type 'unknown'`
- Solução: Tipar corretamente o erro no bloco catch

```typescript
} catch (clientError) {
  const errorMessage = clientError instanceof Error ? clientError.message : 'Erro desconhecido';
  return new Response(
    JSON.stringify({
      error: `Erro ao criar cliente Supabase: ${errorMessage}`,
    }),
    // ...
```

**2. Hook `useUsers.ts` (linhas 122, 128, 204)**
- Erro: Funções RPC `get_user_role` e `set_user_role` não existem no types gerado
- Solução: Substituir por consultas diretas à tabela `user_roles` ao invés de usar RPC

Para `get_user_role` (linha 122):
```typescript
// Substituir RPC por query direta
const { data: roleData, error: roleError } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single();

const role = (roleData?.role as UserRole) || 'editor';
```

Para `set_user_role` (linha 204):
```typescript
// Remover a chamada RPC e usar apenas o fallback direto
// (delete existing + insert new)
```

---

### Arquivos a Modificar
1. `src/pages/Index.tsx` - Remover TimelineSection
2. `src/components/Header.tsx` - Remover links de navegação
3. `src/components/TimelineSection.tsx` - Deletar arquivo
4. `supabase/functions/create-user/index.ts` - Corrigir tipagem do erro
5. `src/hooks/useUsers.ts` - Substituir RPCs por queries diretas

### Resultado Esperado
- A seção "Linha Temporal" será completamente removida do site
- Os links de navegação serão atualizados
- Os erros de build serão corrigidos
