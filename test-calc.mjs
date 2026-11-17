import { computeViability } from './src/features/calculadora/calc.ts';

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

console.log('lucroHectare1:', result.lucroHectare1);
console.log('lucroHectare2:', result.lucroHectare2);
