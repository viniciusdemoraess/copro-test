import type { Class } from '@/hooks/useClasses';
import type { CalculadoraInputs, CalculadoraResult, CalculadoraDetalhes } from '@/types/calculadora';

export function calcularViabilidade(
  classe: Class,
  inputs: CalculadoraInputs
): CalculadoraDetalhes {
  const {
    areaHectares,
    producaoSoja,
    producaoMilho,
    margemLucroSoja,
    margemLucroMilho,
    custoTerceirizacao,
    precoVendaSoja,
    precoVendaMilho,
  } = inputs;

  // Valores padrão se não fornecidos
  const vaultUtil = classe.vida_util_anos || 10;
  const rendimento = classe.rendimento_ha_hora || 3; // hectares por hora
  const precoCopra = classe.preco_compra || 0;
  const manterPercent = classe.manutencao_percent || 5;
  const seguroPercent = classe.seguro_percent || 2;
  const revendaPercent = classe.valor_revenda_percent || 10;

  // ===== CUSTOS =====
  const custoInicial = precoCopra;
  const custoAmortizadoAnual = custoInicial / vaultUtil;
  const custoManutencaoAnual = (custoInicial * manterPercent) / 100;
  const custoSeguroAnual = (custoInicial * seguroPercent) / 100;

  // Capacidade de colheita
  const horasPorDia = 6; // horas de operação por dia
  const diasPrazoPorSafra = 15; // dias disponíveis para colheita por safra
  const hectaresPorDia = rendimento * horasPorDia; // rendimento em ha/hora × horas/dia

  // Estimar custo de operador (padrão: R$ 5.000/mês se máquina ativa)
  const mesesOperacao = areaHectares > 0 ? 1 : 0; // 1 mês de operação
  const salarioMensalOperador = 5000;
  const encargosTrabalhistosPercent = 32.14; // 32,14% de encargos trabalhistas
  const custoOperadorComEncargos = salarioMensalOperador * (1 + encargosTrabalhistosPercent / 100);
  const custoOperadorAnual = mesesOperacao * custoOperadorComEncargos;

  const custosAnuais =
    custoAmortizadoAnual +
    custoManutencaoAnual +
    custoSeguroAnual +
    custoOperadorAnual;

  // ===== RECEITAS =====
  const receitaSoja = producaoSoja * margemLucroSoja;
  const receitaMilho = producaoMilho * margemLucroMilho;

  // Valor de revenda ao final da vida útil
  const receituaRevendaAoFinal = (custoInicial * revendaPercent) / 100 / vaultUtil;

  const lucroLiquido =
    receitaSoja + receitaMilho + receituaRevendaAoFinal - custosAnuais;

  // ===== BREAK-EVEN =====
  // Quanto precisa produzir para cobrir custos da máquina (amortização + seguro + manutenção)
  const custoFixo = custoAmortizadoAnual + custoManutencaoAnual + custoSeguroAnual;
  const margemMediaSoja = (margemLucroSoja + margemLucroMilho) / 2 || 1;
  const sacasMinimosAnual = margemMediaSoja > 0 ? Math.ceil(custoFixo / margemMediaSoja) : 0;

  // Para vencer terceirização: receita deve superar custo de terceirizar
  const custoTerceirizacaoAnual = custoTerceirizacao * areaHectares;
  const margemVantagem = receitaSoja + receitaMilho - custoTerceirizacaoAnual;
  const sacasParaVencerTerceirizacao = margemMediaSoja > 0
    ? Math.ceil((custoTerceirizacaoAnual + custoFixo) / margemMediaSoja)
    : 0;

  // ===== COMPARATIVO =====
  const resultadoTerceirizacao =
    receitaSoja + receitaMilho + receituaRevendaAoFinal - custoTerceirizacaoAnual;

  const economiaBruta = lucroLiquido - resultadoTerceirizacao;

  // ===== INDICADORES =====
  const horasOperacaoPorAno = areaHectares / rendimento;
  const paybackAnos = custoInicial > 0 ? custoInicial / Math.max(lucroLiquido, 0.1) : 0;
  const paybackMeses = Math.round((paybackAnos % 1) * 12);
  const paybackAnosMeses = `${Math.floor(paybackAnos)} anos e ${paybackMeses} meses`;

  const taxaRetornoAnual = custoInicial > 0
    ? ((lucroLiquido / custoInicial) * 100)
    : 0;

  const custoPorHectare = areaHectares > 0 ? custosAnuais / areaHectares : 0;

  // ===== GRÁFICO COMPARATIVO (5 anos) =====
  const graficoComparacao = [];
  for (let ano = 0; ano <= vaultUtil; ano++) {
    const comprando = (lucroLiquido * ano) - custoInicial;
    const terceirizando = resultadoTerceirizacao * ano;
    graficoComparacao.push({
      ano,
      comprando: Math.round(comprando),
      terceirizando: Math.round(terceirizando),
    });
  }

  const results: CalculadoraResult = {
    viavel: lucroLiquido > resultadoTerceirizacao,
    margemVantagem: Math.round(margemVantagem),
    lucroBrutoAnual: Math.round(receitaSoja + receitaMilho),
    custosAnuais: Math.round(custosAnuais),
    lucroLiquido: Math.round(lucroLiquido),
    custoInicial: Math.round(custoInicial),
    custoAmortizadoAnual: Math.round(custoAmortizadoAnual),
    custoManutencaoAnual: Math.round(custoManutencaoAnual),
    custoSeguroAnual: Math.round(custoSeguroAnual),
    custoOperadorAnual: Math.round(custoOperadorAnual),
    receitaSoja: Math.round(receitaSoja),
    receitaMilho: Math.round(receitaMilho),
    receituaRevendaAoFinal: Math.round(receituaRevendaAoFinal),
    sacasMinimosAnual,
    sacasParaVencerTerceirizacao,
    resultadoTerceirizacao: Math.round(resultadoTerceirizacao),
    economiaBruta: Math.round(economiaBruta),
    paybackAnosMeses,
    taxaRetornoAnual: Math.round(taxaRetornoAnual * 10) / 10,
    custoPorHectare: Math.round(custoPorHectare * 100) / 100,
  };

  return {
    inputs,
    results,
    graficoComparacao,
    analiseDetalhada: {
      vida_util: vaultUtil,
      rendimento_ha_hora: rendimento,
      potencia: classe.potencia || 'Não informado',
      horasOperacaoPorAno: Math.round(horasOperacaoPorAno * 10) / 10,
      horasNecessariasPorAno: Math.round(horasOperacaoPorAno * 10) / 10,
      horasPorDia,
      diasPrazoPorSafra,
      hectaresPorDia: Math.round(hectaresPorDia * 10) / 10,
      capacidadeColheitaPorSafra: Math.round(hectaresPorDia * diasPrazoPorSafra * 10) / 10,
    },
  };
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarPorcentagem(valor: number): string {
  return `${(valor * 100).toFixed(1)}%`;
}
