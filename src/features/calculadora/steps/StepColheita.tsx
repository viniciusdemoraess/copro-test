import React from 'react';
import { cn } from '@/lib/utils';
import { StepCard } from '../components/StepCard';
import { NumberField, StepFooter } from '../components/shared';
import type { CalculadoraWizard } from '../useCalculadoraWizard';
import type { UnidadeCustoTerceirizada } from '../types';

const UNITS: UnidadeCustoTerceirizada[] = ['R$/ha', 'R$/sc'];

export function StepColheita({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, errors, updateField, goNext, goBack } = wizard;

  return (
    <StepCard
      title="Colheita"
      subtitle="Informe sua disponibilidade, prazos e quanto custa contratar a colheita na região."
    >
      <div className="grid gap-5 sm:max-w-md">
        <NumberField
          label="Horas diárias disponíveis para colheita"
          suffix="h/dia"
          step="1"
          helper="Entre 1 e 12 horas."
          value={formData.horas_dia}
          error={errors.horas_dia}
          onChange={(v) => updateField('horas_dia', v)}
        />

        <NumberField
          label="Prazo máximo para colher cada safra"
          suffix="dias"
          step="1"
          helper="Entre 15 e 60 dias."
          value={formData.prazo_colheita}
          error={errors.prazo_colheita}
          onChange={(v) => updateField('prazo_colheita', v)}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Custo da colheita terceirizada na região
            </span>
            {/* Toggle de unidade (§3.4): R$/ha vs R$/sc */}
            <div className="inline-flex overflow-hidden rounded-md border border-border">
              {UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => updateField('unidade_custo_terceirizada', u)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium transition-colors',
                    formData.unidade_custo_terceirizada === u
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <NumberField
            label=""
            suffix={formData.unidade_custo_terceirizada}
            value={formData.custo_terceirizada}
            error={errors.custo_terceirizada}
            onChange={(v) => updateField('custo_terceirizada', v)}
          />
        </div>
      </div>

      <StepFooter onBack={goBack} onNext={goNext} nextLabel="Continuar" />
    </StepCard>
  );
}
