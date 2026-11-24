export interface CalculadoraInputs {
  classeId: string;
  areaHectares: number;
  producaoSoja: number; // em sacas
  producaoMilho: number; // em sacas
  margemLucroSoja: number; // R$/saca
  margemLucroMilho: number; // R$/saca
  custoTerceirizacao: number; // R$/hora ou total
  precoVendaSoja: number; // R$/saca
  precoVendaMilho: number; // R$/saca
}

export interface CalculadoraResult {
  viavel: boolean;
  margemVantagem: number; // quanto mais vale comprar do que terceirizar
  lucroBrutoAnual: number;
  custosAnuais: number;
  lucroLiquido: number;

  // Detalhamentos
  custoInicial: number; // valor de compra
  custoAmortizadoAnual: number; // custo dividido por anos de vida útil
  custoManutencaoAnual: number;
  custoSeguroAnual: number;
  custoOperadorAnual: number;

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
