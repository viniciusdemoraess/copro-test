import type { StepId, WizardFormData } from './types';

// Portal oficial do IMEA (Instituto Mato-grossense de Economia Agropecuária).
export const IMEA_URL = 'https://www.imea.com.br/imea-site/indicadores';

export const JANELA_ANOS = 10; // Janela de análise fixa (mín. 10 anos).

export interface StepMeta {
  id: StepId;
  label: string;
}

// Ordem completa das etapas (§2.1). A etapa 'financiamento' é condicional.
export const STEPS: StepMeta[] = [
  { id: 'areas', label: 'Áreas' },
  { id: 'produtividade', label: 'Produtividade e lucro' },
  { id: 'precos', label: 'Preços' },
  { id: 'colheitadeira', label: 'Colheitadeira' },
  { id: 'financiamento', label: 'Financiamento' },
  { id: 'resultados', label: 'Resultados' },
];

// Estado inicial do formulário.
export const INITIAL_FORM_DATA: WizardFormData = {
  area_1safra: null,
  area_2safra: null,
  prod_1safra: null,
  prod_2safra: null,
  lucro_1safra: null,
  lucro_2safra: null,
  preco_1safra: null,
  preco_2safra: null,
  horas_dia: 8,
  prazo_colheita: 30,
  custo_terceirizada: 400,
  unidade_custo_terceirizada: 'R$/ha',
  modelo_colheitadeira: '',
  valor_maquina: null,
  financiada: true,
  pessoas_colheitora: 1,
  salario_pessoa: 5000,
  encargos: 32.3,
  adicional_pessoa: 0,
  perc_financiado: null,
  prazo_pagamento: null,
  taxa_juros: null,
  modelo_financiamento: null,
};

export const SESSION_STORAGE_KEY = 'cooprosoja.calculadora.v1';
