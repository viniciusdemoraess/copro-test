const http = require('http');

async function testCalculator() {
  const data = {
    area_1safra: 100,
    area_2safra: 80,
    prod_1safra: 50,
    prod_2safra: 45,
    preco_1safra: 100,
    preco_2safra: 110,
    lucro_1safra: 20,
    lucro_2safra: 25
  };

  // Test the calc function by importing and running it
  const { computeViability } = await import('./src/features/calculadora/calc.ts');
  
  const result = computeViability({
    area_1safra: 100,
    area_2safra: 80,
    prod_1safra: 50,
    prod_2safra: 45,
    preco_1safra: 100,
    preco_2safra: 110,
    lucro_1safra: 20,
    lucro_2safra: 25,
    horas_dia: 8,
    custo_terceirizada: 50,
    unidade_custo_terceirizada: 'R$/ha',
    modelo_colheitadeira: 'Test Model',
    valor_maquina: 500000,
    financiada: true,
    perc_financiado: 80,
    prazo_pagamento: 5,
    taxa_juros: 10,
    modelo_financiamento: 'SAC'
  });

  console.log('Resultado do cálculo:');
  console.log('Lucro por hectare - 1ª safra: R$', result.lucroHectare1);
  console.log('Lucro por hectare - 2ª safra: R$', result.lucroHectare2);
  console.log('Diferença: R$', result.diferenca);
}

testCalculator().catch(console.error);
