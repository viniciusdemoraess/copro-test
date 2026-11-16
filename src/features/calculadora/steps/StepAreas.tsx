import React from 'react';
import { StepCard } from '../components/StepCard';
import { NumberField, SafraBadge, StepFooter } from '../components/shared';
import type { CalculadoraWizard } from '../useCalculadoraWizard';

export function StepAreas({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, errors, updateField, goNext } = wizard;

  return (
    <StepCard
      title="Área cultivada"
      subtitle="Quantos hectares você plantou em cada safra?"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <SafraBadge safra={1} />
          <NumberField
            label="Área cultivada na 1ª safra"
            suffix="ha"
            value={formData.area_1safra}
            error={errors.area_1safra}
            onChange={(v) => updateField('area_1safra', v)}
          />
        </div>
        <div className="space-y-2">
          <SafraBadge safra={2} />
          <NumberField
            label="Área cultivada na 2ª safra"
            suffix="ha"
            value={formData.area_2safra}
            error={errors.area_2safra}
            onChange={(v) => updateField('area_2safra', v)}
          />
        </div>
      </div>

      <StepFooter showBack={false} onNext={goNext} nextLabel="Continuar" />
    </StepCard>
  );
}
