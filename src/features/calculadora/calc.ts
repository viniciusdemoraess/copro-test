// =============================================================================
// MOTOR DE CÁLCULO — PLACEHOLDER / MOCKUP
// -----------------------------------------------------------------------------
// TODO: substituir pelas fórmulas oficiais da planilha de viabilidade da
// Cooprosoja. Esta implementação é uma aproximação transparente baseada apenas
// nas notas de rodapé do protótipo (PDF §3.7):
//   "Janela de análise = prazo do financiamento (mín. 10 anos).
//    Custo próprio = entrada + parcelas.
//    Custo terceirizado = R$/sc × produção anual × anos."
// Os valores NÃO devem ser usados para decisão real enquanto as fórmulas
// definitivas não forem integradas. Mantida como função pura para que a troca
// das fórmulas não exija mudanças na UI.
// =============================================================================

import { JANELA_ANOS } from './constants';
import type { ViabilityResult, WizardFormData } from './types';

const n = (v: number | null | undefined): number =>
  typeof v === 'number' && !Number.isNaN(v) ? v : 0;

// Produção anual total (sacas) somando as duas safras.
function producaoAnualSacas(data: WizardFormData): number {
  const safra1 = n(data.area_1safra) * n(data.prod_1safra);
  const safra2 = n(data.area_2safra) * n(data.prod_2safra);
  return safra1 + safra2;
}

// Receita bruta anual (R$) somando as duas safras.
function receitaAnual(data: WizardFormData): number {
  const safra1 = n(data.area_1safra) * n(data.prod_1safra) * n(data.preco_1safra);
  const safra2 = n(data.area_2safra) * n(data.prod_2safra) * n(data.preco_2safra);
  return safra1 + safra2;
}

// Lucro em sacas por hectare para a 1ª safra (produtividade × percentual de lucro)
function lucroSacas1(data: WizardFormData): number {
  const prod = n(data.prod_1safra);
  const lucroPercent = n(data.lucro_1safra);
  return (prod * lucroPercent) / 100;
}

// Lucro em sacas por hectare para a 2ª safra (produtividade × percentual de lucro)
function lucroSacas2(data: WizardFormData): number {
  const prod = n(data.prod_2safra);
  const lucroPercent = n(data.lucro_2safra);
  return (prod * lucroPercent) / 100;
}

// Lucro em R$ por hectare para a 1ª safra (receita × percentual de lucro)
function lucroHectare1(data: WizardFormData): number {
  const receita = n(data.prod_1safra) * n(data.preco_1safra);
  const lucroPercent = n(data.lucro_1safra);
  return (receita * lucroPercent) / 100;
}

// Lucro em R$ por hectare para a 2ª safra (receita × percentual de lucro)
function lucroHectare2(data: WizardFormData): number {
  const receita = n(data.prod_2safra) * n(data.preco_2safra);
  const lucroPercent = n(data.lucro_2safra);
  return (receita * lucroPercent) / 100;
}

// Custo total de terceirização acumulado na janela de análise.
function custoTerceirizadaAcumulado(data: WizardFormData, anos: number): number {
  const custo = n(data.custo_terceirizada);
  if (data.unidade_custo_terceirizada === 'R$/sc') {
    return custo * producaoAnualSacas(data) * anos;
  }
  // R$/ha
  const areaTotal = n(data.area_1safra) + n(data.area_2safra);
  return custo * areaTotal * anos;
}

// Custo acumulado da máquina própria: entrada + parcelas (aproximação simples).
function custoMaquinaPropria(data: WizardFormData): number {
  const valor = n(data.valor_maquina);
  if (!data.financiada) return valor;

  const perc = n(data.perc_financiado) / 100;
  const financiado = valor * perc;
  const entrada = valor - financiado;
  const taxa = n(data.taxa_juros) / 100;
  const prazo = Math.max(1, n(data.prazo_pagamento));

  // Aproximação: juros simples sobre o saldo financiado ao longo do prazo.
  // (SAC e PRICE resultam no mesmo total aqui — detalhamento virá com a planilha.)
  const jurosTotais = financiado * taxa * ((prazo + 1) / 2);
  return entrada + financiado + jurosTotais;
}

export function computeViability(data: WizardFormData): ViabilityResult {
  const anos = JANELA_ANOS;
  const receitaAcumulada = receitaAnual(data) * anos;

  const custoPropria = custoMaquinaPropria(data);
  const custoTerceirizada = custoTerceirizadaAcumulado(data, anos);

  const resultadoPropria = receitaAcumulada - custoPropria;
  const resultadoTerceirizada = receitaAcumulada - custoTerceirizada;

  return {
    modelo: data.modelo_colheitadeira?.trim() || 'Colheitadeira',
    janelaAnos: anos,
    propria: {
      receitaAcumulada,
      custoAcumulado: custoPropria,
      resultadoAcumulado: resultadoPropria,
      viavel: resultadoPropria >= resultadoTerceirizada,
    },
    terceirizada: {
      receitaAcumulada,
      custoAcumulado: custoTerceirizada,
      resultadoAcumulado: resultadoTerceirizada,
      viavel: resultadoTerceirizada >= resultadoPropria,
    },
    diferenca: resultadoPropria - resultadoTerceirizada,
    lucroSacas1: lucroSacas1(data),
    lucroSacas2: lucroSacas2(data),
    lucroHectare1: lucroHectare1(data),
    lucroHectare2: lucroHectare2(data),
  };
}
