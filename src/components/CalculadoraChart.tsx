import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalculadoraDetalhes } from '@/types/calculadora';

interface CalculadoraChartProps {
  data: CalculadoraDetalhes;
}

export function CalculadoraChart({ data }: CalculadoraChartProps) {
  const chartData = data.graficoComparacao.map((item) => ({
    ano: item.ano,
    'Comprando': item.comprando,
    'Terceirizando': item.terceirizando,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold">Ano {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparação ao Longo do Tempo</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Acúmulo de lucro: Comprando vs Terceirizando
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ano"
              label={{ value: 'Anos', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Resultado (R$)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Comprando"
              stroke="#22c55e"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Comprando"
            />
            <Line
              type="monotone"
              dataKey="Terceirizando"
              stroke="#3b82f6"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Terceirizando"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded">
            <p className="text-muted-foreground">Maior economia em</p>
            <p className="font-semibold text-green-700">
              {data.analiseDetalhada.vida_util} anos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (vida útil estimada)
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded">
            <p className="text-muted-foreground">Ponto de equilíbrio</p>
            <p className="font-semibold text-blue-700">
              {Math.round(
                data.graficoComparacao.find(
                  (item) => item.comprando >= item.terceirizando
                )?.ano || 0
              )}{' '}
              anos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (quando comprar passa a valer mais)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
