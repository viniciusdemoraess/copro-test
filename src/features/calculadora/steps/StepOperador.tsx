import React from 'react';
import { StepCard } from '../components/StepCard';
import { NumberField, StepFooter } from '../components/shared';
import type { CalculadoraWizard } from '../useCalculadoraWizard';

export function StepOperador({ wizard }: { wizard: CalculadoraWizard }) {
  const { formData, errors, updateField, goNext, goBack } = wizard;

  // Calcula meses de colheita por ano: (prazo_colheita / 30) * 2 safras
  const mesesColheita =
    formData.prazo_colheita && formData.prazo_colheita > 0
      ? (formData.prazo_colheita / 30) * 2
      : 0;

  // Calcula custo anual do operador
  const custoAnual = (() => {
    const pessoas = formData.pessoas_colheitora || 0;
    const salario = formData.salario_pessoa || 0;
    const encargosPercent = formData.encargos || 0;
    const adicional = formData.adicional_pessoa || 0;

    const salarioComEncargos = salario * (1 + encargosPercent / 100);
    const custoMensalPorPessoa = salarioComEncargos + adicional;
    return pessoas * custoMensalPorPessoa * mesesColheita;
  })();

  return (
    <StepCard
      title="Operador"
      subtitle="Informe os dados de custo com o operador da colheitadeira durante a colheita."
    >
      <div className="space-y-6">
        <div className="grid gap-5 sm:max-w-md">
          <NumberField
            label="Pessoas na colheitora"
            suffix="pessoas"
            step="1"
            helper="Operador e ajudantes, se houver."
            value={formData.pessoas_colheitora}
            error={errors.pessoas_colheitora}
            onChange={(v) => updateField('pessoas_colheitora', v)}
          />

          <NumberField
            label="Salário por pessoa"
            suffix="R$/mês"
            value={formData.salario_pessoa}
            error={errors.salario_pessoa}
            onChange={(v) => updateField('salario_pessoa', v)}
          />

          <NumberField
            label="Encargos"
            suffix="%"
            helper="Sobre o salário."
            value={formData.encargos}
            error={errors.encargos}
            onChange={(v) => updateField('encargos', v)}
          />

          <NumberField
            label="Adicional / bônus por pessoa"
            suffix="R$/mês"
            helper="Hora extra, prêmio por produção etc."
            value={formData.adicional_pessoa}
            error={errors.adicional_pessoa}
            onChange={(v) => updateField('adicional_pessoa', v)}
          />
        </div>

        {/* Resumo calculado */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Meses de colheita por ano</span>
            <span className="font-semibold text-foreground">
              {mesesColheita.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
            <span className="text-muted-foreground">Custo anual do operador</span>
            <span className="text-lg font-bold text-primary">
              R$ {custoAnual.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <StepFooter onBack={goBack} onNext={goNext} nextLabel="Continuar" />
    </StepCard>
  );
}
