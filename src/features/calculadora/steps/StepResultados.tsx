import React, { useMemo, useState } from 'react';
import { Shield, Tractor, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/format-utils';
import { computeViability } from '../calc';
import { generateCalculadoraPDF } from '../utils/generatePDF';
import type { CalculadoraWizard } from '../useCalculadoraWizard';
import type { ViabilityResult } from '../types';

function ViabilidadeBadge({ viavel }: { viavel: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        viavel
          ? 'bg-primary/10 text-primary'
          : 'bg-destructive/10 text-destructive'
      )}
    >
      {viavel ? 'Viável' : 'Inviável'}
    </span>
  );
}

function Linha({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', negative && 'text-destructive')}>
        {negative ? `- ${formatBRL(value)}` : formatBRL(value)}
      </span>
    </div>
  );
}

function ResultadoCard({
  icon,
  titulo,
  dados,
}: {
  icon: React.ReactNode;
  titulo: string;
  dados: ViabilityResult['propria'];
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          {icon}
          {titulo}
        </div>
        <Linha label="Receita total acumulada" value={dados.receitaAcumulada} />
        <Linha label="Custo total acumulado" value={dados.custoAcumulado} negative />
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Resultado acumulado</p>
            <p className="text-2xl font-bold text-foreground">
              {formatBRL(dados.resultadoAcumulado)}
            </p>
          </div>
          <ViabilidadeBadge viavel={dados.viavel} />
        </div>
      </CardContent>
    </Card>
  );
}

export function StepResultados({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, goBack, reset } = wizard;
  const result = useMemo(() => computeViability(formData), [formData]);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      await generateCalculadoraPDF(formData, result);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="mb-1 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Resultados da simulação
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Com base nos dados informados nas etapas anteriores.
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm font-medium text-foreground">
          Tabela Resumo do Resultado — {result.modelo}
          <span className="ml-2 font-normal text-muted-foreground">
            Janela de análise: {result.janelaAnos} anos
          </span>
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <ResultadoCard
            icon={<Tractor className="h-5 w-5 text-primary" />}
            titulo={`Máquina própria: ${result.modelo}`}
            dados={result.propria}
          />
          <ResultadoCard
            icon={<Shield className="h-5 w-5 text-amber-600" />}
            titulo="Colheita terceirizada"
            dados={result.terceirizada}
          />
        </div>

        {/* Card destaque da diferença consolidada */}
        <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50/60 p-4">
          <p className="text-sm text-foreground">
            Diferença entre o resultado da máquina própria e da terceirização no{' '}
            {result.janelaAnos}º ano
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatBRL(result.diferenca)}
          </p>
        </div>

        {/* Lucro por hectare por safra */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Lucro por hectare
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">1ª Safra - Sacas</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {result.lucroSacas1.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">sacas por hectare</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">1ª Safra - Financeiro</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatBRL(result.lucroHectare1)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">R$ por hectare</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">2ª Safra - Sacas</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {result.lucroSacas2.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">sacas por hectare</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">2ª Safra - Financeiro</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatBRL(result.lucroHectare2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">R$ por hectare</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota de rodapé obrigatória — PLACEHOLDER de cálculo */}
        <p className="mt-4 text-xs text-muted-foreground">
          Simulação de validação de fluxo. Os valores são uma aproximação e serão
          substituídos pelas fórmulas oficiais da planilha de viabilidade da
          Cooprosoja. Janela de análise = prazo do financiamento (mín. 10 anos).
          Custo próprio = entrada + parcelas. Custo terceirizado = R$/sc × produção
          anual × anos.
        </p>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={goBack}>
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {generatingPDF ? 'Gerando PDF...' : 'Gerar PDF'}
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              Nova simulação
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
