import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCalculadora } from './CalculadoraContext';
import { CalculadoraBreadcrumb } from './components/CalculadoraBreadcrumb';
import { useCalculadoraWizard } from './useCalculadoraWizard';
import { StepAreas } from './steps/StepAreas';
import { StepProdutividade } from './steps/StepProdutividade';
import { StepPrecos } from './steps/StepPrecos';
import { StepColheitadeira } from './steps/StepColheitadeira';
import { StepFinanciamento } from './steps/StepFinanciamento';
import { StepResultados } from './steps/StepResultados';
import type { StepId } from './types';

const CalculadoraDialog: React.FC = () => {
  const { open, setOpen } = useCalculadora();
  const wizard = useCalculadoraWizard();

  const stepComponents: Record<StepId, React.ReactNode> = {
    areas: <StepAreas wizard={wizard} />,
    produtividade: <StepProdutividade wizard={wizard} />,
    precos: <StepPrecos wizard={wizard} />,
    colheitadeira: <StepColheitadeira wizard={wizard} />,
    financiamento: <StepFinanciamento wizard={wizard} />,
    resultados: <StepResultados wizard={wizard} />,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl md:text-2xl font-bold text-foreground pr-8">
            Calculadora Cooprosoja de Viabilidade de Aquisição de Colheitadeiras
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Informe os dados da sua lavoura e veja receita, lucro, tempo de colheita
            e se vale a pena comprar uma colheitadeira.
          </DialogDescription>
        </DialogHeader>

        <CalculadoraBreadcrumb
          steps={wizard.steps}
          currentStep={wizard.currentStep}
          onStepClick={wizard.goToStep}
        />

        {stepComponents[wizard.currentStep]}
      </DialogContent>
    </Dialog>
  );
};

export default CalculadoraDialog;
