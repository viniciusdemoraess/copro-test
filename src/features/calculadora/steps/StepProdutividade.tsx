import React from 'react';
import { StepCard } from '../components/StepCard';
import {
  ImeaCallout,
  NumberField,
  SafraBadge,
  StepFooter,
} from '../components/shared';
import type { CalculadoraWizard } from '../useCalculadoraWizard';

export function StepProdutividade({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, errors, updateField, goNext, goBack } = wizard;

  return (
    <StepCard
      title="Produtividade e percentual de lucro"
      subtitle="Use a média das últimas safras ou a meta deste ano."
    >
      <div className="mb-5">
        <ImeaCallout />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <SafraBadge safra={1} />
          <NumberField
            label="Produtividade da 1ª safra"
            suffix="sc/ha"
            value={formData.prod_1safra}
            error={errors.prod_1safra}
            onChange={(v) => updateField('prod_1safra', v)}
          />
          <NumberField
            label="Percentual de lucro da 1ª safra"
            suffix="%"
            helper="Margem sobre a receita bruta."
            value={formData.lucro_1safra}
            error={errors.lucro_1safra}
            onChange={(v) => updateField('lucro_1safra', v)}
          />
        </div>
        <div className="space-y-4">
          <SafraBadge safra={2} />
          <NumberField
            label="Produtividade da 2ª safra"
            suffix="sc/ha"
            value={formData.prod_2safra}
            error={errors.prod_2safra}
            onChange={(v) => updateField('prod_2safra', v)}
          />
          <NumberField
            label="Percentual de lucro da 2ª safra"
            suffix="%"
            helper="Margem sobre a receita bruta."
            value={formData.lucro_2safra}
            error={errors.lucro_2safra}
            onChange={(v) => updateField('lucro_2safra', v)}
          />
        </div>
      </div>

      <StepFooter onBack={goBack} onNext={goNext} nextLabel="Continuar" />
    </StepCard>
  );
}
