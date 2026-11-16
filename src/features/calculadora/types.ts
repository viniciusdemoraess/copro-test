// Contrato de dados do Wizard da Calculadora de Viabilidade de Colheitadeiras.
// Baseado na Especificação Técnica de UI/UX (PDF §4.1).

export type FinancingModel = 'SAC' | 'PRICE';

export type UnidadeCustoTerceirizada = 'R$/ha' | 'R$/sc';

export type StepId =
  | 'areas'
  | 'produtividade'
  | 'precos'
  | 'colheitadeira'
  | 'financiamento'
  | 'resultados';

export interface WizardFormData {
  // Etapa 1: Áreas
  area_1safra: number | null; // Hectares (ha)
  area_2safra: number | null; // Hectares (ha)

  // Etapa 2: Produtividade e Lucro
  prod_1safra: number | null; // sc/ha
  prod_2safra: number | null; // sc/ha
  lucro_1safra: number | null; // Percentual (%)
  lucro_2safra: number | null; // Percentual (%)

  // Etapa 3: Preços
  preco_1safra: number | null; // R$/sc
  preco_2safra: number | null; // R$/sc

  // Etapa 4: Colheita
  horas_dia: number | null; // h/dia
  prazo_colheita: number | null; // Dias (15-60)
  custo_terceirizada: number | null; // R$/ha ou R$/sc
  unidade_custo_terceirizada: UnidadeCustoTerceirizada;

  // Etapa 5: Colheitadeira
  modelo_colheitadeira: string;
  valor_maquina: number | null; // Valor numérico desmascarado (ex: 3500000.00)
  financiada: boolean; // true = Sim, false = Não

  // Etapa 6: Operador
  pessoas_colheitora: number | null; // Quantidade de pessoas
  salario_pessoa: number | null; // R$/mês
  encargos: number | null; // % sobre salário
  adicional_pessoa: number | null; // R$/mês (hora extra, bônus, etc)

  // Etapa 7: Financiamento (Condicional)
  perc_financiado?: number | null; // Percentual (%)
  prazo_pagamento?: number | null; // Anos (1 a 8)
  taxa_juros?: number | null; // % ao ano
  modelo_financiamento?: FinancingModel | null;
}

// Resultado consolidado renderizado na Etapa 8.
export interface ViabilityResult {
  modelo: string;
  janelaAnos: number;
  propria: {
    receitaAcumulada: number;
    custoAcumulado: number;
    resultadoAcumulado: number;
    viavel: boolean;
  };
  terceirizada: {
    receitaAcumulada: number;
    custoAcumulado: number;
    resultadoAcumulado: number;
    viavel: boolean;
  };
  diferenca: number;
  lucroSacas1: number; // Lucro em sacas por hectare - 1ª safra
  lucroSacas2: number; // Lucro em sacas por hectare - 2ª safra
  lucroHectare1: number; // Lucro em R$ por hectare - 1ª safra
  lucroHectare2: number; // Lucro em R$ por hectare - 2ª safra
}

export type CalculadoraErrors = Partial<Record<keyof WizardFormData, string>>;
