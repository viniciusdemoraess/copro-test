import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { StepCard } from '../components/StepCard';
import { NumberField, StepFooter } from '../components/shared';
import type { CalculadoraWizard } from '../useCalculadoraWizard';
import type { FinancingModel } from '../types';

export function StepFinanciamento({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, errors, updateField, goNext, goBack } = wizard;

  return (
    <StepCard
      title="Financiamento"
      subtitle="Condições da operação. As parcelas são anuais."
    >
      <div className="grid gap-5 sm:max-w-md">
        <NumberField
          label="Percentual a ser financiado"
          suffix="%"
          value={formData.perc_financiado ?? null}
          error={errors.perc_financiado}
          onChange={(v) => updateField('perc_financiado', v)}
        />
        <NumberField
          label="Prazo de pagamento"
          suffix="anos"
          step="1"
          helper="Entre 1 e 8 anos."
          value={formData.prazo_pagamento ?? null}
          error={errors.prazo_pagamento}
          onChange={(v) => updateField('prazo_pagamento', v)}
        />
        <NumberField
          label="Taxa de juros da operação"
          suffix="% ao ano"
          value={formData.taxa_juros ?? null}
          error={errors.taxa_juros}
          onChange={(v) => updateField('taxa_juros', v)}
        />

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Modelo de financiamento
          </Label>
          <RadioGroup
            value={formData.modelo_financiamento ?? ''}
            onValueChange={(v) =>
              updateField('modelo_financiamento', v as FinancingModel)
            }
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="SAC" id="modelo-sac" />
              <Label htmlFor="modelo-sac" className="cursor-pointer">
                SAC
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="PRICE" id="modelo-price" />
              <Label htmlFor="modelo-price" className="cursor-pointer">
                PRICE
              </Label>
            </div>
          </RadioGroup>
          {errors.modelo_financiamento ? (
            <p className="text-xs text-destructive">
              {errors.modelo_financiamento}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              SAC: parcelas decrescentes. PRICE: parcelas iguais.
            </p>
          )}
        </div>
      </div>

      <StepFooter onBack={goBack} onNext={goNext} nextLabel="Ver resultados" />
    </StepCard>
  );
}
