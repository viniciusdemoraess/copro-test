import { z } from 'zod';
import type { StepId, WizardFormData } from './types';

// Helpers de mensagens reutilizáveis.
const requiredPositive = (msg = 'Informe um valor maior que zero') =>
  z
    .number({ invalid_type_error: msg, required_error: msg })
    .refine((v) => v !== null && v !== undefined, { message: msg })
    .refine((v) => v > 0, { message: msg });

const percent = (msg = 'Informe um percentual entre 0 e 100') =>
  z
    .number({ invalid_type_error: msg, required_error: msg })
    .min(0, msg)
    .max(100, msg);

// Área cultivada: obrigatória, de 1 a 100.000 ha.
const area = (msg: string) =>
  z
    .number({ invalid_type_error: msg, required_error: msg })
    .min(1, 'O valor deve ser de no mínimo 1 ha')
    .max(100000, 'O valor máximo é 100.000 ha');

// Schema por etapa. Cada um valida apenas os campos da sua etapa (§4.2).
const areasSchema = z.object({
  area_1safra: area('Informe a área da 1ª safra'),
  area_2safra: area('Informe a área da 2ª safra'),
});

const produtividadeSchema = z.object({
  prod_1safra: requiredPositive('Informe a produtividade da 1ª safra'),
  prod_2safra: requiredPositive('Informe a produtividade da 2ª safra'),
  lucro_1safra: percent('Lucro da 1ª safra deve estar entre 0 e 100%'),
  lucro_2safra: percent('Lucro da 2ª safra deve estar entre 0 e 100%'),
});

const precosSchema = z.object({
  preco_1safra: requiredPositive('Informe o preço da 1ª safra'),
  preco_2safra: requiredPositive('Informe o preço da 2ª safra'),
});

const colheitaSchema = z.object({
  horas_dia: z
    .number({ invalid_type_error: 'Informe as horas disponíveis' })
    .int('Use um número inteiro de horas')
    .min(1, 'Mínimo de 1 hora')
    .max(12, 'Máximo de 12 horas'),
  prazo_colheita: z
    .number({ invalid_type_error: 'Informe o prazo máximo de colheita' })
    .int('Use um número inteiro de dias')
    .min(15, 'Mínimo de 15 dias')
    .max(60, 'Máximo de 60 dias'),
  custo_terceirizada: requiredPositive('Informe o custo da colheita terceirizada'),
});

const colheitadeiraSchema = z.object({
  modelo_colheitadeira: z
    .string()
    .trim()
    .min(2, 'Informe o modelo da colheitadeira'),
  valor_maquina: requiredPositive('Informe o valor da colheitadeira'),
  financiada: z.boolean(),
});

const operadorSchema = z.object({
  pessoas_colheitora: z
    .number({ invalid_type_error: 'Informe a quantidade de pessoas' })
    .int('Use um número inteiro')
    .min(1, 'Mínimo de 1 pessoa'),
  salario_pessoa: requiredPositive('Informe o salário por pessoa'),
  encargos: percent('Encargos deve estar entre 0 e 100%'),
  adicional_pessoa: z
    .number({ invalid_type_error: 'Informe o adicional por pessoa' })
    .min(0, 'O valor não pode ser negativo'),
});

const financiamentoSchema = z.object({
  perc_financiado: z
    .number({ invalid_type_error: 'Informe o percentual financiado' })
    .min(1, 'Mínimo de 1%')
    .max(100, 'Máximo de 100%'),
  prazo_pagamento: z
    .number({ invalid_type_error: 'Informe o prazo' })
    .int('Use um número inteiro de anos')
    .min(1, 'Mínimo de 1 ano')
    .max(8, 'Máximo de 8 anos'),
  taxa_juros: requiredPositive('Informe a taxa de juros'),
  modelo_financiamento: z.enum(['SAC', 'PRICE'], {
    errorMap: () => ({ message: 'Selecione o modelo de financiamento' }),
  }),
});

const STEP_SCHEMAS: Partial<Record<StepId, z.ZodTypeAny>> = {
  areas: areasSchema,
  produtividade: produtividadeSchema,
  precos: precosSchema,
  colheita: colheitaSchema,
  colheitadeira: colheitadeiraSchema,
  operador: operadorSchema,
  financiamento: financiamentoSchema,
};

export interface StepValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof WizardFormData, string>>;
}

// Valida os campos de uma etapa e devolve erros por campo.
export function validateStepData(
  stepId: StepId,
  data: WizardFormData
): StepValidationResult {
  const schema = STEP_SCHEMAS[stepId];
  if (!schema) return { valid: true, errors: {} };

  const result = schema.safeParse(data);
  if (result.success) return { valid: true, errors: {} };

  const errors: Partial<Record<keyof WizardFormData, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof WizardFormData;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { valid: false, errors };
}
