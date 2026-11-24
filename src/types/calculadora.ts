export interface CalculadoraInputs {
  classeId: string;
  areaHectares: number;

  // 1ª Safra (Soja)
  produtividadeSoja: number; // sacas/hectare
  margemLucroSojaPercent: number; // percentual (%)
  precoVendaSoja: number; // R$/saca

  // 2ª Safra (Milho)
  produtividadeMilho: number; // sacas/hectare
  margemLucroMilhoPercent: number; // percentual (%)
  precoVendaMilho: number; // R$/saca

  // Legado (manter compatibilidade)
  producaoSoja?: number; // em sacas (calculado automaticamente)
  producaoMilho?: number; // em sacas (calculado automaticamente)
  margemLucroSoja?: number; // R$/saca (calculado automaticamente)
  margemLucroMilho?: number; // R$/saca (calculado automaticamente)
  custoTerceirizacao?: number; // R$/ha
}

export interface CalculadoraResult {
  viavel: boolean;
  margemVantagem: number; // quanto mais vale comprar do que terceirizar
  lucroBrutoAnual: number;
  custosAnuais: number; // CUSTO TOTAL ANUAL SEM FINANCIAMENTO
  lucroLiquido: number;

  // Detalhamentos de custos
  custoInicial: number; // valor de compra da máquina
  custoAmortizadoAnual: number; // depreciação anual (preço / vida útil)
  custoManutencaoAnual: number; // manutenção anual
  custoSeguroAnual: number; // seguro anual
  custoOperadorAnual: number; // operador + encargos trabalhistas

  // Receitas
  receitaSoja: number;
  receitaMilho: number;
  receituaRevendaAoFinal: number; // valor residual do equipamento

  // Break-even
  sacasMinimosAnual: number; // para pagar custo da máquina
  sacasParaVencerTerceirizacao: number; // para ser melhor que terceirizar

  // Comparativo
  resultadoTerceirizacao: number;
  economiaBruta: number;

  // Indicadores
  paybackAnosMeses: string;
  taxaRetornoAnual: number;
  custoPorHectare: number;
}

export interface CalculadoraDetalhes {
  inputs: CalculadoraInputs;
  results: CalculadoraResult;
  graficoComparacao: { ano: number; comprando: number; terceirizando: number }[];
  analiseDetalhada: {
    vida_util: number;
    rendimento_ha_hora: number;
    potencia: string;
    horasOperacaoPorAno: number;
    horasNecessariasPorAno: number;
    horasPorDia: number;
    diasPrazoPorSafra: number;
    hectaresPorDia: number;
    capacidadeColheitaPorSafra: number;
  };
}
