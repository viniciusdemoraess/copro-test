import React from 'react';
import { StepCard } from '../components/StepCard';
import {
  ImeaCallout,
  NumberField,
  SafraBadge,
  StepFooter,
} from '../components/shared';
import type { CalculadoraWizard } from '../useCalculadoraWizard';

export function StepPrecos({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, errors, updateField, goNext, goBack } = wizard;

  return (
    <StepCard
      title="Preço da saca"
      subtitle="Preço esperado de venda de cada cultura."
    >
      <div className="mb-5">
        <ImeaCallout />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <SafraBadge safra={1} />
          <NumberField
            label="Preço da cultura de 1ª safra"
            suffix="R$/sc"
            value={formData.preco_1safra}
            error={errors.preco_1safra}
            onChange={(v) => updateField('preco_1safra', v)}
          />
        </div>
        <div className="space-y-2">
          <SafraBadge safra={2} />
          <NumberField
            label="Preço da cultura de 2ª safra"
            suffix="R$/sc"
            value={formData.preco_2safra}
            error={errors.preco_2safra}
            onChange={(v) => updateField('preco_2safra', v)}
          />
        </div>
      </div>

      <StepFooter onBack={goBack} onNext={goNext} nextLabel="Continuar" />
    </StepCard>
  );
}
