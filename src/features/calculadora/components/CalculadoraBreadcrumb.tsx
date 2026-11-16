import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEPS } from '../constants';
import type { StepId } from '../types';

interface Props {
  steps: StepId[]; // etapas visíveis (financiamento pode estar oculto)
  currentStep: StepId;
  onStepClick: (stepId: StepId) => void;
}

// Breadcrumb horizontal com estados Ativo / Concluído / Desabilitado (§2.3).
// Etapas ocultas (financiamento quando não financiado) simplesmente não entram em `steps`.
export function CalculadoraBreadcrumb({ steps, currentStep, onStepClick }: Props) {
  const labelFor = (id: StepId) => STEPS.find((s) => s.id === id)?.label ?? id;
  const currentIdx = steps.indexOf(currentStep);

  return (
    <nav
      aria-label="Progresso da calculadora"
      className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm"
    >
      {steps.map((id, idx) => {
        const isActive = id === currentStep;
        const isCompleted = idx < currentIdx;
        const isDisabled = idx > currentIdx;

        return (
          <React.Fragment key={id}>
            {idx > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
            <button
              type="button"
              onClick={() => !isDisabled && onStepClick(id)}
              disabled={isDisabled}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'rounded-full px-3 py-1 font-medium transition-colors',
                isActive && 'bg-primary text-primary-foreground',
                isCompleted &&
                  'text-foreground hover:bg-muted cursor-pointer',
                isDisabled &&
                  'text-muted-foreground opacity-50 cursor-not-allowed'
              )}
            >
              {labelFor(id)}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
