# Calculadora de Viabilidade de Colheita

## Visão Geral

A Calculadora de Viabilidade foi implementada baseada no arquivo Excel "Análise de Colhedora - Cooprosoja.xlsm". Permite que agricultores analisem se vale a pena comprar uma colhedora para suas propriedades.

## Arquitetura

### Componentes Criados

1. **`src/types/calculadora.ts`**
   - Tipos TypeScript para inputs e resultados
   - Define interfaces para `CalculadoraInputs`, `CalculadoraResult`, `CalculadoraDetalhes`

2. **`src/services/calculadora.ts`**
   - Lógica de cálculo completa
   - Função `calcularViabilidade()` implementa todas as fórmulas do Excel
   - Funções de formatação (`formatarMoeda`, `formatarPorcentagem`)

3. **`src/components/Calculadora.tsx`**
   - Componente principal interativo
   - Formulário de entrada de dados
   - Exibição de resultados
   - Indicadores de viabilidade

4. **`src/components/CalculadoraChart.tsx`**
   - Gráfico comparativo (Recharts)
   - Mostra acúmulo de lucro ao longo dos anos
   - Compara "Comprando" vs "Terceirizando"

5. **`src/pages/Calculadora.tsx`**
   - Página pública da calculadora

## Fluxo de Dados

```
useClasses (hook)
    ↓
Busca modelos de colhedora do Supabase (tabela "classes")
    ↓
Formulário (Calculadora component)
    ↓
Inputs do usuário:
  - Modelo selecionado
  - Área em hectares
  - Produção (soja/milho)
  - Margens de lucro
  - Custo de terceirização
    ↓
calcularViabilidade() (service)
    ↓
Resultados:
  - Viabilidade (sim/não)
  - Custos detalhados
  - Receitas projetadas
  - Break-even analysis
  - Comparativo com terceirização
    ↓
Exibição:
  - Indicadores principais
  - Detalhes técnicos (opcional)
  - Gráfico comparativo
```

## Dados Necessários no Banco de Dados

### Tabela `classes`
Já existe com campos:
- `id` (UUID)
- `classe` (string) - Nome do modelo
- `potencia` (string) - Potência da máquina
- `preco_compra` (numeric) - Preço de compra
- `vida_util_anos` (integer) - Anos de vida útil
- `valor_revenda_percent` (numeric) - % de revenda ao final
- `manutencao_percent` (numeric) - % de manutenção anual
- `seguro_percent` (numeric) - % de seguro anual
- `rendimento_ha_hora` (numeric) - Hectares colhidos por hora

### Tabela `ipca` (opcional)
Para ajustes inflacionários:
- `id` (integer)
- `ano` (integer)
- `percentual` (numeric)
- `created_at`, `updated_at`

## Fórmulas Implementadas

### Custos Anuais
```
Amortização = Preço Compra / Vida Útil
Manutenção = Preço × % Manutenção
Seguro = Preço × % Seguro
Operador = R$ 3.000 × (meses com operação)
Total = Amortização + Manutenção + Seguro + Operador
```

### Receitas
```
Receita Soja = Produção Soja × Margem Lucro
Receita Milho = Produção Milho × Margem Lucro
Revenda = Preço × % Revenda / Vida Útil
Total = Soja + Milho + Revenda
```

### Indicadores
```
Lucro Líquido = Total Receitas - Total Custos
Viável = Lucro Comprar > Lucro Terceirizar
Payback = Preço / Lucro Anual
Taxa Retorno = (Lucro / Preço) × 100
Break-even = Custo Fixo / Margem Média
```

## Uso

### Para Usuários Finais
1. Acesse `/calculadora`
2. Selecione modelo de colhedora
3. Preencha dados da propriedade (área, produção esperada, margens)
4. Visualize resultados instantaneamente
5. Clique em "Mostrar Detalhes Técnicos" para análise completa
6. Consulte gráfico comparativo

### Para Desenvolvedores

#### Adicionar novo modelo de colhedora
```typescript
// No Supabase, inserir na tabela 'classes':
{
  classe: "Nova Modelo",
  potencia: "180 cv",
  preco_compra: 450000,
  vida_util_anos: 10,
  valor_revenda_percent: 15,
  manutencao_percent: 5,
  seguro_percent: 2,
  rendimento_ha_hora: 3.5
}
```

#### Usar o cálculo em outro componente
```typescript
import { calcularViabilidade } from '@/services/calculadora';
import { useClasses } from '@/hooks/useClasses';

const classe = classes.find(c => c.id === modeloId);
const resultado = calcularViabilidade(classe, inputs);

console.log(resultado.results.viavel); // true/false
console.log(resultado.results.lucroLiquido); // número
```

## Manutenção

### Campos que podem ser customizados
- `custoOperadorAnual`: Atualmente R$ 3.000/mês (linha 33 em `calculadora.ts`)
- `margemMediaSoja`: Cálculo de break-even (linha 50)
- Fórmulas de depreciação e amortização

### Testes Recomendados
1. Verificar cálculos com valores reais de propriedades
2. Comparar com resultados do Excel original
3. Validar gráficos com diferentes cenários
4. Testar com valores extremos (área muito pequena/grande)

## Próximas Melhorias

- [ ] Adicionar histórico de cálculos
- [ ] Exportar resultado em PDF
- [ ] Incluir IPCA para ajuste inflacionário
- [ ] Adicionar múltiplos cenários de produção
- [ ] Integrar com dados reais de IPCA automático
- [ ] Dashboard de análise comparativa entre modelos
- [ ] Simulador com slider de valores

## Integração com Excel

O arquivo original pode ser mantido para:
1. Validação de fórmulas
2. Testes de casos reais
3. Backup de cálculos complexos

Arquivo de referência:
`C:\Users\SauloCarvalhoGomes\OneDrive\Área de Trabalho\arquivos\Clientes\AGRITI\COOPROSOJA\Calculadora\Análise de Colhedora - Cooprosoja.xlsm`

## Support

Para adicionar novos campos ou modificar lógica:
1. Editar `src/types/calculadora.ts`
2. Atualizar `src/services/calculadora.ts`
3. Atualizar `src/components/Calculadora.tsx`
4. Testar com múltiplos cenários
